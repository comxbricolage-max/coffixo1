import clientPromise from './mongodb'

export async function getDb() {
  const client = await clientPromise
  return client.db('caffexo')
}

export async function getUsersCollection() {
  const db = await getDb()
  return db.collection('users')
}

