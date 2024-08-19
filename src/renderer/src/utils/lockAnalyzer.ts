import { DeadLock, Transaction } from '@renderer/type/interfaces'

const deadLockStart = `------------------------
LATEST DETECTED DEADLOCK
------------------------`
const holdLockLogStart = 'HOLDS THE LOCK(S):'
const waitForLockLogStart = 'WAITING FOR THIS LOCK TO BE GRANTED'

export const analyze = (deadLockLog: string): DeadLock => {
  const deadLock: DeadLock = { transactions: [] }

  const transactions = deadLock.transactions

  const timeStart = deadLockLog.indexOf(deadLockStart) + deadLockStart.length
  const timeMatch = deadLockLog.substring(timeStart).match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)
  if (timeMatch) {
    deadLock.created = timeMatch[0]
  }
  const transactionLogs = deadLockLog.split('TRANSACTION:')
  for (const transactionLog of transactionLogs) {
    const transaction: Transaction = {}
    const transactionIdMatch = transactionLog.match(/TRANSACTION (\d+)/)
    const threadIdMatch = transactionLog.match(/MySQL thread id (\d+)/)
    const queryIdMatch = transactionLog.match(/query id \d+ .* (.*)\n/)
    if (transactionIdMatch) {
      transaction.transactionId = transactionIdMatch[1]
      transactions.push(transaction)
    }
    if (threadIdMatch) {
      transaction.threadId = threadIdMatch[1]
    }
    if (queryIdMatch) {
      transaction.sqlType = queryIdMatch[1]
      const sqlStart = transactionLog.indexOf(queryIdMatch[0]) + queryIdMatch[0].length
      const sqlEnd = transactionLog.indexOf('*** ', sqlStart)
      transaction.transactionSql = transactionLog.substring(sqlStart, sqlEnd)
    }
    const waitForLogStartIndex = transactionLog.indexOf(waitForLockLogStart)
    const waitForLog = transactionLog.substring(waitForLogStartIndex + waitForLockLogStart.length)
    const waitForLockMatch = waitForLog.match(
      /.* space id \d+ page no \d+ n bits \d+ index (.*) of table `(.*)`.`(.*)` trx id \d+ lock_mode (.*)/
    )
    if (waitForLockMatch) {
      transaction.waitLockIndex = waitForLockMatch[1]
      transaction.waitLockTable = `\`${waitForLockMatch[2]}\`.\`${waitForLockMatch[3]}\``
      transaction.waitLockType = waitForLockMatch[4]
    }
    const holdLockStartIndex = transactionLog.indexOf(holdLockLogStart)
    if (holdLockStartIndex > -1) {
      const holdLockLog = transactionLog.substring(
        holdLockStartIndex + holdLockLogStart.length,
        waitForLogStartIndex + 1
      )
      const holdLockMatch = holdLockLog.match(
        /.* space id \d+ page no \d+ n bits \d+ index (.*) of table `(.*)`.`(.*)` trx id \d+ lock_mode (.*)/
      )
      if (holdLockMatch) {
        transaction.holdLockIndex = holdLockMatch[1]
        transaction.holdLockTable = `\`${holdLockMatch[2]}\`.\`${holdLockMatch[3]}\``
        transaction.holdLockType = holdLockMatch[4]
      }
    }
  }
  const rollbackMatch = deadLockLog.match(/WE ROLL BACK TRANSACTION \((\d+)\)/)
  if (rollbackMatch) {
    transactions[Number(rollbackMatch[1]) - 1].rollback = true
  }
  return deadLock
}
