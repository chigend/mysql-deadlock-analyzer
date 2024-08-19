export interface Transaction {
  transactionId?: string
  threadId?: string
  transactionSql?: string
  sqlType?: string
  waitLockTable?: string
  waitLockIndex?: string
  waitLockType?: string
  holdLockTable?: string
  holdLockIndex?: string
  holdLockType?: string
  rollback?: boolean
}
export interface DeadLock {
  created?: string
  transactions: Transaction[]
}
