import { z } from "zod";
export const contactSchema = z.object({
  full_name:   z.string().min(2, "Please enter your full name.").max(100),
  company:     z.string().min(1, "Please enter your company name.").max(200),
  phone:       z.string().min(7, "Please enter a valid phone number.").max(30),
  email:       z.string().email("Please enter a valid email address.").max(254),
  location:    z.enum(["London", "Manchester", "Other"], {
                 error: "Please select a location.",
               }),
  crew_type:   z.enum([
                 "Crew Boss / Site Supervisor",
                 "Scenic & Build Crew",
                 "Event & Scenic Carpenters",
                 "Festival & Touring Crew",
                 "Telehandler Operators",
                 "Mixed crew package",
               ], { error: "Please select a crew type." }),
  event_dates: z.string().min(3, "Please provide your event dates.").max(200),
  message:     z.string().max(2000).optional(),
  cf_turnstile_response: z.string().optional(),
});
export type ContactFormData = z.infer<typeof contactSchema>;
