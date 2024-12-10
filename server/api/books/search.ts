import { PrismaClient } from '@prisma/client'
import { defineEventHandler, getQuery } from 'h3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const title = query.title as string

  if (!title) {
    return { error: 'Title is required' }
  }

  // Search in local database
  const localBooks = await prisma.book.findMany({
    where: {
      title: {
        contains: title
      }
    },
    include: {
      author: true,
      publisher: true,
      series: true,
    },
    take: 5
  })

  if (localBooks.length > 0) {
    return { source: 'local', books: localBooks }
  }

  // Search using external APIs
  try {
    // National Diet Library API (example, you need to implement actual API call)
    // const ndlResponse = await axios.get(`https://iss.ndl.go.jp/api/sru?operation=searchRetrieve&query=title=${encodeURIComponent(title)}`)
    // if (ndlResponse.data.numberOfRecords > 0) {
    //   // Process and return NDL data
    //   return { source: 'ndl', books: processNDLData(ndlResponse.data) }
    // }

    // // Hanmoto.com API (example, you need to implement actual API call)
    // const hanmotoResponse = await axios.get(`https://api.hanmoto.com/search?title=${encodeURIComponent(title)}`)
    // if (hanmotoResponse.data.books.length > 0) {
    //   // Process and return Hanmoto data
    //   return { source: 'hanmoto', books: processHanmotoData(hanmotoResponse.data) }
    // }

    // // Amazon API (example, you need to implement actual API call with proper authentication)
    // const amazonResponse = await axios.get(`https://webservices.amazon.com/paapi5/searchitems?Keywords=${encodeURIComponent(title)}`)
    // if (amazonResponse.data.Items.length > 0) {
    //   // Process and return Amazon data
    //   return { source: 'amazon', books: processAmazonData(amazonResponse.data) }
    // }

    return { source: 'none', books: [] }
  } catch (error) {
    console.error('Error searching external APIs:', error)
    return { error: 'Failed to search external APIs' }
  }
})

function processNDLData(data: any) {
  // Implement NDL data processing
  return []
}

function processHanmotoData(data: any) {
  // Implement Hanmoto data processing
  return []
}

function processAmazonData(data: any) {
  // Implement Amazon data processing
  return []
}