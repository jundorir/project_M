import classNames from "classnames";
import css from "./index.module.less";
import React from "react";
import RedeemModal from "../../components/RedeemModal";
import PledgeModal from "../../components/PledgeModal";
import { inject, observer } from "mobx-react";
import { Toast } from "antd-mobile";
import { interception } from "@utils/common";
import NewRedeemModal from "../../components/NewRedeemModal";

function BottomInfo(props) {
  const { lang, chain, computationalPower, round, server } = props;
  const { selectedLang } = lang;
  const {
    myTInDeposit = 0,
    myWFILInDeposit = 0,
    TBalance = 0,
    totalLpInPool = 1000000,
    totalSales = 2000,
    pledgeTotalPower = 0,
  } = computationalPower.round.get(round) || {};
  const { release_lock = 0 } = server.OrdinaryT[round] ?? {};
  const { is_stack = "0", product_hashrate } =
    server.productInfo?.get(round) || {};

  const [language, setLanguage] = React.useState([]);
  const [showModal, setShowModal] = React.useState("");

  const closeModal = React.useCallback(() => {
    setShowModal("");
  }, []);

  let pledgeTotalPercent = 0;
  let current_product_hashrate = 0;
  if (totalSales !== 0) {
    pledgeTotalPercent = (pledgeTotalPower / totalSales).toFixed(8);
  }
  if (pledgeTotalPercent !== 0) {
    current_product_hashrate = (product_hashrate / pledgeTotalPercent).toFixed(
      8
    );
  } else {
    current_product_hashrate = (product_hashrate * totalSales).toFixed(8);
  }

  React.useEffect(() => {
    const g_language = {
      English: {
        myPledgeTPower: "PledgedTPower:",
        myPledgeWFILPower: "PledgedWFILPower:",
        myTBalance: "TPowerBalance:",
        myLockT: "MyLockT:",
        notActive: "Please bind the inviter to activate the account first",
        pledge: "pledge",
        redeem: "redeem",
        already: "T/WFIL quantity is pledged",
        undamagedT: "My pledged T",
        pledgePercent: "My pledge percentage",
        notStart: "pledge has not been opened",
        current: 'Actual output per T per day'
      },
      TraditionalChinese: {
        myPledgeTPower: "??????????????????:",
        myPledgeWFILPower: "????????????WFIL:",
        myTBalance: "?????????????????????:",
        myLockT: "??????T?????????:",
        notActive: "?????????????????????????????????",
        pledge: "??????",
        redeem: "??????",
        already: "?????????T/WFIL??????",
        undamagedT: "????????????T",
        pledgePercent: "??????????????????",
        notStart: "??????????????????",
        current: '???T??????????????????',
      },
      SimplifiedChinese: {
        myPledgeTPower: "??????????????????:",
        myPledgeWFILPower: "????????????WFIL:",
        myTBalance: "?????????????????????:",
        myLockT: "??????T?????????:",
        notActive: "?????????????????????????????????",
        pledge: "??????",
        redeem: "??????",
        already: "?????????T/WFIL??????",
        undamagedT: "????????????T",
        pledgePercent: "??????????????????",
        notStart: "??????????????????",
        current: '???T??????????????????'
      },
    };

    setLanguage(g_language[selectedLang.key]);
  }, [selectedLang.key]);

  function renderModal() {
    if (showModal === "redeem") {
      if (round > 4) {
        return <NewRedeemModal closeModal={closeModal} round={round} />;
      }
      return <RedeemModal closeModal={closeModal} round={round} />;
    }

    if (showModal === "pledge") {
      return <PledgeModal closeModal={closeModal} round={round} />;
    }

    return null;
  }
  React.useEffect(() => {
    if (chain.address) {
      computationalPower.queryMyTInDesposit(round);
      computationalPower.queryWFILInDesposit(round);
      computationalPower.queryTBalance(round);
      if (round > 4) {
        computationalPower.queryTotalLpInPool(round);
      }
    }
  }, [chain.address, computationalPower, round]);

  function renderList() {
    if (round > 4) {
      return (
        <>
          <div className={css.item}>
            <div className={css.left}>{language.undamagedT}</div>
            <div className={css.right}>{myTInDeposit * 2}T</div>
          </div>
          <div className={css.item}>
            <div className={css.left}>{language.pledgePercent}</div>
            <div className={css.right}>
              {((myTInDeposit * 2 * 100) / totalSales).toFixed(2)}%
            </div>
          </div>
          <div className={css.item}>
            <div className={css.left}>{language.current}</div>
            <div className={css.right}>{current_product_hashrate}WFIL</div>
          </div>
          {/* <div className={css.item}>
            <div className={css.left}>{language.LPPercent}</div>
            <div className={css.right}>
              {((myWFILInDeposit * 100) / totalLpInPool).toFixed(4)}%
            </div>
          </div> */}
        </>
      );
    }

    return (
      <>
        <div className={css.item}>
          <div className={css.left}>{language.myPledgeTPower}</div>
          <div className={css.right}>{myTInDeposit}T</div>
        </div>
        <div className={css.item}>
          <div className={css.left}>{language.myPledgeWFILPower}</div>
          <div className={css.right}>{myWFILInDeposit}WFIL</div>
        </div>
        <div className={css.item}>
          <div className={css.left}>{language.myLockT}</div>
          <div className={css.right}>
            {(myTInDeposit * release_lock).toFixed(4)}WFIL
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={css.bottomInfo}>
      <div className={css.title}>{language.already}</div>
      <div className={css.list}>
        {renderList()}
        <div className={classNames(css.item, css.last)}>
          <div className={css.left}>{language.myTBalance}</div>
          <div className={css.right}>{interception(TBalance)}T</div>
        </div>
      </div>
      <div className={css.buttons}>
        <div
          className={classNames(
            css.button,
            !(is_stack === "1" && chain.address && chain.isActive) &&
              css.disabled
          )}
          onClick={() => {
            if (is_stack === "0") {
              Toast.fail(language.notStart);
              return;
            }
            if (chain.address && chain.isActive) {
              setShowModal("pledge");
            } else if (!chain.isActive) {
              Toast.fail(language.notActive);
            }
          }}
        >
          {language.pledge}
        </div>
        <div
          className={classNames(
            css.button,
            css.replevy,
            !(chain.address && chain.isActive) && css.disabled
          )}
          onClick={() => {
            if (chain.address && chain.isActive) {
              setShowModal("redeem");
            } else if (!chain.isActive) {
              Toast.fail(language.notActive);
            }
          }}
        >
          {language.redeem}
        </div>
      </div>

      {renderModal()}
    </div>
  );
}

export default inject(
  "lang",
  "chain",
  "server",
  "computationalPower"
)(observer(BottomInfo));
