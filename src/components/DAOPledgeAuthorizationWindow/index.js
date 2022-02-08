import React from 'react'
import css from './index.module.less'
import close from '@assets/images/icon/close.png'
import reauthorization from '@assets/images/icon/reauthorization.png'
import { inject, observer } from 'mobx-react'
import { Toast } from 'antd-mobile'

function ReauthorizationWindow(props) {
  const { lang, chain, MMRApprove, USDTApprove, updateData } = props
  const { selectedLang } = lang
  const [language, setLanguage] = React.useState([])
  React.useEffect(() => {
    if (selectedLang.key === 'English') {
      setLanguage([
        'asset deficiency',
        'Please authorize',
        'Authorized',
        'Authorized',
        'Authorization success'
      ])
    } else if (selectedLang.key === 'TraditionalChinese') {
      setLanguage(['授權資產不足', '請授權', '授權', '授權', '授權成功'])
    } else if (selectedLang.key === 'SimplifiedChinese') {
      setLanguage(['授权资产不足', '请授权', '授权', '授权', '授权成功'])
    }
  }, [selectedLang.key])
  const closeWindow = React.useCallback(() => {
    props.closeAuthorizationWindow()
  }, [props])
  // 授权MMR
  const toApproveMMR = React.useCallback(async () => {
    let symbol = 'MMR'
    let { status, approveAmount } = await chain.toApprove({
      type: 'Board',
      symbol
    })
    if (status) {
      updateData()
      Toast.success(`${language[4]}`)
      // console.log(USDTApprove, MMRApprove)
      if (USDTApprove) {
        closeWindow()
      }
    }
  }, [chain, closeWindow, language])
  // 授权USDT
  const toApproveUSDT = React.useCallback(async () => {
    let symbol = 'USDT'
    let { status, approveAmount } = await chain.toApprove({
      type: 'Board',
      symbol
    })
    if (status) {
      updateData()
      Toast.success(`${language[4]}`)
      // console.log(MMRApprove, USDTApprove)
      if (MMRApprove) {
        closeWindow()
      }
    }
  }, [chain, closeWindow, language])
  return (
    <div
      className={css.gainWindow}
      onClick={() => {
        closeWindow()
      }}
    >
      <div
        className={css.gainBox}
        onClick={e => {
          e.stopPropagation()
        }}
      >
        {/* 关闭按钮 */}
        <div className={css.closeImgBox}>
          <img
            onClick={e => {
              e.stopPropagation()
              closeWindow()
            }}
            className={css.closeImg}
            src={close}
            alt=" "
          />
        </div>
        {/* getsuccess图 */}
        <div className={css.logImg}>
          <img src={reauthorization} alt="" className={css.img} />
        </div>
        {/* 标题 */}
        {/* <div className={css.title}>{language[1]}</div> */}
        {/* 按钮 */}
        {USDTApprove ? (
          ''
        ) : (
          <>
            <div className={css.bottomButton}>
              <div className={css.title}>USDT {language[0]}</div>
              <div className={css.authorizationBTN} onClick={toApproveUSDT}>
                {language[2]}
              </div>
            </div>
            {USDTApprove || MMRApprove ? '' : <div className={css.line}></div>}
          </>
        )}
        {MMRApprove ? (
          ''
        ) : (
          <>
            <div className={css.bottomButton}>
              <div className={css.title}>MMR {language[0]}</div>
              <div className={css.pledgeBTN} onClick={toApproveMMR}>
                {language[3]}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default inject('lang', 'chain')(observer(ReauthorizationWindow))
