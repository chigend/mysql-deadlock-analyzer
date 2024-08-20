import { DeadLock, Transaction } from '@renderer/type/interfaces'
import { analyze } from '@renderer/utils/lockAnalyzer'
import { Button, Input, Tooltip, message } from 'antd'
import { memo, ReactElement, useEffect, useRef, useState } from 'react'
import { mapKey } from '@renderer/utils/keys'
import '@renderer/assets/app.scss'
import { Copy } from '@icon-park/react'
import classNames from 'classnames'
const { TextArea } = Input

const App = memo(() => {
  const [log, setLog] = useState<string>('')
  const [analyzeCount, setAnalyzeCount] = useState<number>(0)
  const [deadLock, setDeadLock] = useState<DeadLock>({ transactions: [] })
  const [analyzed, setAnalyzed] = useState<boolean>(false)
  const logRef = useRef(log)

  useEffect(() => {
    logRef.current = log
  }, [log])

  useEffect(() => {
    const backToAnalyze = (): void => {
      setAnalyzed(false)
    }
    window.api.on('back', backToAnalyze)
    return (): void => {
      window.api.off('back', backToAnalyze)
    }
  }, [])

  useEffect(() => {
    const analyze = (): void => analyzeLog()
    window.api.on('analyze', analyze)
    return (): void => {
      window.api.off('analyze', analyze)
    }
  }, [])

  const analyzeLog = (): void => {
    if (analyzed) {
      return
    }
    const deadLock = analyze(logRef.current)
    if (deadLock.transactions.length > 0) {
      setDeadLock(deadLock)
      setAnalyzeCount(analyzeCount + 1)
      setAnalyzed(true)
    } else {
      message.warning({ content: '未分析出有死锁日志, 请检查' })
    }
  }

  const copySql = (sql: string): void => {
    navigator.clipboard.writeText(sql)
    message.success({ content: '复制sql成功' })
  }

  const renderTd = (dataIndex: keyof Transaction, tooltip = false): ReactElement[] => {
    if (tooltip) {
      return deadLock.transactions.map((t, i: number) => {
        const value: string = t[dataIndex] as string
        const overflow = value && value.length > 120
        return (
          <td key={i} data-scroll={true}>
            <Tooltip trigger={'click'} title={value}>
              <span>{overflow ? value.substring(0, 120) + '...' : value}</span>
            </Tooltip>
            <Copy
              onClick={() => copySql(value)}
              theme="outline"
              size="16"
              className="cursor-pointer inline-block ml-3"
              fill="#333"
            />
          </td>
        )
      })
    }
    return deadLock.transactions.map((t, i: number) => <td key={i}>{t[dataIndex]}</td>)
  }

  const renderAnalyzeResult = (): ReactElement => {
    return (
      <div
        className={classNames(
          'container',
          'absolute',
          `${analyzed ? 'container-show' : 'container-hide'}`
        )}
      >
        <h2 className="text-center mb-3">分析结果</h2>
        <div className="flex justify-center">
          <table>
            <thead>
              <tr>
                <td colSpan={deadLock.transactions.length + 1}>发生时间:{deadLock?.created}</td>
              </tr>
            </thead>
            <thead>
              <tr>
                <td></td>
                {deadLock.transactions.map((t, index) => (
                  <td
                    data-rollback={t.rollback}
                    key={index}
                  >{`事务${index + 1}${t.rollback ? '(已回滚)' : ''}`}</td>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Thread ID</td>
                {renderTd('threadId')}
              </tr>
              <tr>
                <td>事务ID</td>
                {renderTd('transactionId')}
              </tr>
              <tr>
                <td>请求类型</td>
                {renderTd('sqlType')}
              </tr>
              <tr>
                <td>等待表</td>
                {renderTd('waitLockTable')}
              </tr>
              <tr>
                <td>等待索引名</td>
                {renderTd('waitLockIndex')}
              </tr>
              <tr>
                <td>等待锁类型</td>
                {renderTd('waitLockType')}
              </tr>
              <tr>
                <td>持有锁表名</td>
                {renderTd('holdLockTable')}
              </tr>
              <tr>
                <td>持有锁索引名</td>
                {renderTd('holdLockIndex')}
              </tr>
              <tr>
                <td>持有锁类型</td>
                {renderTd('holdLockType')}
              </tr>
              <tr>
                <td>事务sql</td>
                {renderTd('transactionSql', true)}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-center">
          <Button className="mt-5" onClick={() => setAnalyzed(false)}>
            {`返回继续分析(${mapKey('Cmd')}+B)`}
          </Button>
        </div>
      </div>
    )
  }

  const renderLogInput = () => {
    return (
      <div
        className={classNames(
          'container',
          'absolute',
          analyzeCount > 0
            ? `${analyzed ? 'log-input-container-hide' : 'log-input-container-show'}`
            : ''
        )}
      >
        <div className="mt-5">
          请输入&nbsp;
          <span className="italic font-bold" style={{ color: '#e74c3c' }}>
            SHOW ENGINE INNODB STATUS
          </span>
          &nbsp;的结果
        </div>
        <TextArea rows={23} value={log} onChange={(v) => setLog(v.target.value)}></TextArea>
        <div className="flex justify-center">
          <Button className="mt-5" type="primary" onClick={() => analyzeLog()}>
            {`开始分析(${mapKey('Cmd')}+J)`}
          </Button>
        </div>
      </div>
    )
  }

  const renderBody = (): ReactElement => {
    if (analyzeCount == 0) {
      return <>{renderLogInput()}</>
    }
    return (
      <>
        {renderLogInput()}
        {renderAnalyzeResult()}
      </>
    )
  }

  return <div className="p-8 relative">{renderBody()}</div>
})

export default App
