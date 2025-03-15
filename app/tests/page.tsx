import React from 'react'
import { getTests } from '~/server/test_queries'
const page = async () => {
    const tests = await getTests()
  return (
    <div>
        {tests.map((test) => (
            <div key={test.id}>
                <h1>{test.name}</h1>
            </div>
        ))}
    </div>
  )
}


export default page;