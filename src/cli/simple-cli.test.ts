import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createCli, run } from './simple-cli';

describe('CLI', () => {
  it('exports createCli and run functions', () => {
    assert.equal(typeof createCli, 'function');
    assert.equal(typeof run, 'function');
  });

  it('createCli returns a program named claude-flow', () => {
    const cli = createCli();
    assert.equal(cli.name(), 'claude-flow');
  });

  it('program has version 1.0.0', () => {
    const cli = createCli();
    assert.equal(cli.version(), '1.0.0');
  });

  it('program has checkpoint subcommand', () => {
    const cli = createCli();
    const names = cli.commands.map(c => c.name());
    assert.ok(names.includes('checkpoint'));
  });

  it('checkpoint command has create, list, restore subcommands', () => {
    const cli = createCli();
    const checkpoint = cli.commands.find(c => c.name() === 'checkpoint');
    assert.ok(checkpoint);
    const subNames = checkpoint!.commands.map(c => c.name());
    assert.ok(subNames.includes('create'));
    assert.ok(subNames.includes('list'));
    assert.ok(subNames.includes('restore'));
  });
});
