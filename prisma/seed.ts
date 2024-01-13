import { PrismaClient } from '@prisma/client'

async function seed() {
	const prisma = new PrismaClient()

	try {
		// Insert dummy data into the Transaction table
		// await prisma.transaction.create({
		// 	data: {
		// 		plaidId: '12345',
		// 		plaidAccountId: '54321',
		// 		accountName: 'Savings Account',
		// 		amount: 100.5,
		// 		category: 'Groceries',
		// 		date: new Date('2023-01-01T08:00:00Z'),
		// 		dateTime: new Date('2023-01-01T08:00:00Z'),
		// 		authorizedDatetime: new Date('2023-01-01T08:00:00Z'),
		// 		name: 'Transaction 1',
		// 		merchantName: 'Merchant 1',
		// 		paymentChannel: 'Online',
		// 		address: '123 Main St',
		// 		city: 'City 1',
		// 		region: 'Region 1',
		// 		postalCode: '12345',
		// 		country: 'Country 1',
		// 		latitude: 40.7128,
		// 		longitude: -74.006,
		// 	},
		// })
		//
		// await prisma.transaction.create({
		// 	data: {
		// 		plaidId: '67890',
		// 		plaidAccountId: '09876',
		// 		accountName: 'Checking Account',
		// 		amount: 75.25,
		// 		category: 'Dining',
		// 		date: new Date('2023-01-02T12:00:00Z'),
		// 		dateTime: new Date('2023-01-02T12:00:00Z'),
		// 		authorizedDatetime: new Date('2023-01-02T12:00:00Z'),
		// 		name: 'Transaction 2',
		// 		merchantName: 'Merchant 2',
		// 		paymentChannel: 'In-Person',
		// 		address: '456 Elm St',
		// 		city: 'City 2',
		// 		region: 'Region 2',
		// 		postalCode: '67890',
		// 		country: 'Country 2',
		// 		latitude: 34.0522,
		// 		longitude: -118.2437,
		// 	},
		// })

		console.log('Data seeded successfully')
	} catch (error) {
		console.error('Error seeding data:', error)
	} finally {
		await prisma.$disconnect()
	}
}

seed()
