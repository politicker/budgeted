import { z } from 'zod'

export const CreateConfigInput = z.object({
	plaidClientId: z.string(),
	plaidSecret: z.string(),
})
