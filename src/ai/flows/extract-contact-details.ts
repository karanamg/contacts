'use server';
/**
 * @fileOverview Extracts contact details from an image of a business card.
 *
 * - extractContactDetails - A function that handles the contact detail extraction process.
 * - ExtractContactDetailsInput - The input type for the extractContactDetails function.
 * - ExtractContactDetailsOutput - The return type for the ExtractContactDetails function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ExtractContactDetailsInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the business card photo.'),
});
export type ExtractContactDetailsInput = z.infer<typeof ExtractContactDetailsInputSchema>;

const ExtractContactDetailsOutputSchema = z.object({
  name: z.string().describe('The name of the contact.'),
  phone: z.string().describe('The phone number of the contact.'),
  email: z.string().describe('The email address of the contact.'),
  organization: z.string().describe('The organization of the contact, if any.'),
  title: z.string().describe('The title of the contact, if any.'),
  address: z.string().describe('The address of the contact, if any.'),
  website: z.string().describe('The website of the contact, if any.'),
});
export type ExtractContactDetailsOutput = z.infer<typeof ExtractContactDetailsOutputSchema>;

export async function extractContactDetails(input: ExtractContactDetailsInput): Promise<ExtractContactDetailsOutput> {
  return extractContactDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractContactDetailsPrompt',
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the business card photo.'),
    }),
  },
  output: {
    schema: z.object({
      name: z.string().describe('The name of the contact.'),
      phone: z.string().describe('The phone number of the contact.'),
      email: z.string().describe('The email address of the contact.'),
      organization: z.string().describe('The organization of the contact, if any.'),
      title: z.string().describe('The title of the contact, if any.'),
      address: z.string().describe('The address of the contact, if any.'),
      website: z.string().describe('The website of the contact, if any.'),
    }),
  },
  prompt: `You are an expert in extracting contact information from images of business cards.

  Given the image, extract the name, phone number, email, organization, title, address, and website from the business card.

  Output the data in JSON format.

  Business Card Image: {{media url=photoUrl}}`,
});

const extractContactDetailsFlow = ai.defineFlow<
  typeof ExtractContactDetailsInputSchema,
  typeof ExtractContactDetailsOutputSchema
>({
  name: 'extractContactDetailsFlow',
  inputSchema: ExtractContactDetailsInputSchema,
  outputSchema: ExtractContactDetailsOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
