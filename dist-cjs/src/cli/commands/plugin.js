"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginCommand = pluginCommand;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const MARKETPLACE_FILE = ".claude-plugin/marketplace.json";
function loadMarketplace() {
    if (!fs.existsSync(MARKETPLACE_FILE)) {
        return {
            version: "1.0.0",
            lastUpdated: new Date().toISOString(),
            plugins: [],
            installed: [],
            registry: { url: "", lastSynced: new Date().toISOString() },
        };
    }
    return JSON.parse(fs.readFileSync(MARKETPLACE_FILE, "utf8"));
}
function saveMarketplace(marketplace) {
    const dir = path.dirname(MARKETPLACE_FILE);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(MARKETPLACE_FILE, JSON.stringify(marketplace, null, 2));
}
function deriveNamespace(authorName) {
    return `${authorName.toLowerCase()}-claude-ads`;
}
function pluginCommand(program) {
    const cmd = program.command("plugin").description("Manage Claude Flow plugins");
    const marketplace = cmd.command("marketplace").description("Marketplace operations");
    marketplace
        .command("add <source>")
        .description("Add a plugin from a marketplace source (e.g. Author/plugin-name)")
        .action((source) => {
        const [authorName, repoName] = source.split("/");
        if (!authorName || !repoName) {
            console.error(`Invalid source format: ${source}. Expected <author>/<repo>`);
            process.exit(1);
        }
        const namespace = deriveNamespace(authorName);
        const pluginName = repoName;
        const mp = loadMarketplace();
        const exists = mp.plugins.some((p) => p.source === source);
        if (exists) {
            console.log(`Plugin already in marketplace: ${source}`);
            return;
        }
        const entry = {
            name: pluginName,
            namespace,
            source,
            description: "Comprehensive paid advertising audit, optimization, and AI creative generation. 250+ checks across Google, Meta, YouTube, LinkedIn, TikTok, Microsoft, and Apple Ads.",
            version: "1.5.1",
            author: {
                name: authorName,
                url: `https://github.com/${authorName}`,
            },
            homepage: `https://github.com/${source}`,
            repository: `https://github.com/${source}`,
            license: "MIT",
            category: "marketing",
            tags: [
                "advertising",
                "audit",
                "google-ads",
                "meta-ads",
                "linkedin-ads",
                "tiktok-ads",
                "microsoft-ads",
                "apple-ads",
                "ppc",
                "optimization",
                "creative-generation",
            ],
            skills: [
                "ads",
                "ads-audit",
                "ads-google",
                "ads-meta",
                "ads-youtube",
                "ads-linkedin",
                "ads-tiktok",
                "ads-microsoft",
                "ads-creative",
                "ads-landing",
                "ads-budget",
                "ads-plan",
                "ads-competitor",
                "ads-math",
                "ads-test",
                "ads-dna",
                "ads-generate",
                "ads-photoshoot",
                "ads-create",
                "ads-apple",
            ],
            agents: [
                "audit-google",
                "audit-meta",
                "audit-creative",
                "audit-tracking",
                "audit-budget",
                "audit-compliance",
                "copy-writer",
                "creative-strategist",
                "format-adapter",
                "visual-designer",
            ],
        };
        mp.plugins.push(entry);
        mp.lastUpdated = new Date().toISOString();
        mp.registry.lastSynced = new Date().toISOString();
        saveMarketplace(mp);
        console.log(`Added plugin to marketplace: ${source} (namespace: ${namespace})`);
    });
    marketplace
        .command("list")
        .description("List all plugins in the marketplace")
        .action(() => {
        const mp = loadMarketplace();
        if (mp.plugins.length === 0) {
            console.log("No plugins in marketplace.");
            return;
        }
        mp.plugins.forEach((p) => {
            const isInstalled = mp.installed.some((i) => i.namespace === p.namespace);
            console.log(`${p.name}@${p.namespace}  v${p.version}  [${p.source}]${isInstalled ? "  (installed)" : ""}`);
        });
    });
    cmd
        .command("install <nameAtNamespace>")
        .description("Install a plugin by name@namespace (e.g. claude-ads@agricidaniel-claude-ads)")
        .action((nameAtNamespace) => {
        const atIndex = nameAtNamespace.indexOf("@");
        if (atIndex === -1) {
            console.error(`Invalid format: ${nameAtNamespace}. Expected <name>@<namespace>`);
            process.exit(1);
        }
        const pluginName = nameAtNamespace.slice(0, atIndex);
        const namespace = nameAtNamespace.slice(atIndex + 1);
        const mp = loadMarketplace();
        const pluginDef = mp.plugins.find((p) => p.name === pluginName && p.namespace === namespace);
        if (!pluginDef) {
            console.error(`Plugin not found in marketplace: ${nameAtNamespace}`);
            console.error("Run 'claude-flow plugin marketplace add <source>' first.");
            process.exit(1);
        }
        const alreadyInstalled = mp.installed.some((i) => i.namespace === namespace);
        if (alreadyInstalled) {
            console.log(`Plugin already installed: ${nameAtNamespace}`);
            return;
        }
        const installed = {
            name: pluginName,
            namespace,
            version: pluginDef.version,
            installedAt: new Date().toISOString(),
            skillsPath: ".claude/skills/",
            agentsPath: ".claude/agents/",
        };
        mp.installed.push(installed);
        mp.lastUpdated = new Date().toISOString();
        saveMarketplace(mp);
        console.log(`Installed plugin: ${nameAtNamespace} v${pluginDef.version}`);
        console.log(`Skills path: ${installed.skillsPath}`);
        console.log(`Agents path: ${installed.agentsPath}`);
    });
    cmd
        .command("list")
        .description("List installed plugins")
        .action(() => {
        const mp = loadMarketplace();
        if (mp.installed.length === 0) {
            console.log("No plugins installed.");
            return;
        }
        mp.installed.forEach((p) => {
            console.log(`${p.name}@${p.namespace}  v${p.version}  installed: ${p.installedAt}`);
        });
    });
    cmd
        .command("uninstall <nameAtNamespace>")
        .description("Uninstall a plugin by name@namespace")
        .action((nameAtNamespace) => {
        const atIndex = nameAtNamespace.indexOf("@");
        if (atIndex === -1) {
            console.error(`Invalid format: ${nameAtNamespace}. Expected <name>@<namespace>`);
            process.exit(1);
        }
        const namespace = nameAtNamespace.slice(atIndex + 1);
        const mp = loadMarketplace();
        const before = mp.installed.length;
        mp.installed = mp.installed.filter((i) => i.namespace !== namespace);
        if (mp.installed.length === before) {
            console.error(`Plugin not installed: ${nameAtNamespace}`);
            process.exit(1);
        }
        mp.lastUpdated = new Date().toISOString();
        saveMarketplace(mp);
        console.log(`Uninstalled plugin: ${nameAtNamespace}`);
    });
    return cmd;
}
//# sourceMappingURL=plugin.js.map