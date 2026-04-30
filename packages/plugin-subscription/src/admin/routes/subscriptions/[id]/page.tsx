import {
  Container,
  Heading,
  Table
} from "@medusajs/ui"
import { useParams, Link } from "react-router-dom"
import { SubscriptionData } from "../../../types/index.js"
import { sdk } from "../../../lib/sdk.js"
import { useCallback, useEffect, useState } from "react"

const SubscriptionPage = () => {
  const { id } = useParams()
  const [data, setData] = useState<{ subscription: SubscriptionData } | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSubscription = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await sdk.client.fetch(`/admin/subscriptions/${id}`)
      setData(result as { subscription: SubscriptionData })
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  return (
    <Container>
      {isLoading && <span>Loading...</span>}
      {data?.subscription && (
        <>
          <Heading level="h1">Orders of Subscription #{data.subscription.id}</Heading>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>#</Table.HeaderCell>
                <Table.HeaderCell>Date</Table.HeaderCell>
                <Table.HeaderCell>View Order</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.subscription.orders?.map((order) => (
                <Table.Row key={order.id}>
                  <Table.Cell>{order.id}</Table.Cell>
                  <Table.Cell>{(new Date(order.created_at)).toDateString()}</Table.Cell>
                  <Table.Cell>
                    <Link to={`/orders/${order.id}`}>
                      View Order
                    </Link>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </>
      )}
    </Container>
  )
}

export default SubscriptionPage
