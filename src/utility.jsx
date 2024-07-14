import React, { useState, useEffect } from "react";
import { generateIcon } from "./generate-fileld";
import { Checkbox, ConfigProvider } from "antd";
import { MdOutlineAccessTime } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { BiLoaderCircle } from "react-icons/bi";
import { InputComponent } from "./generate-fileld";
import { useDispatch, useSelector } from "react-redux";
import { acTimer } from "./context/timer";
import { FiArrowRight } from "react-icons/fi";
import { BsCheckLg } from "react-icons/bs";
import { acDiscount } from "./context/action";

const CartModal = ({ setOpen, open }) => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const discount = useSelector((state) => state.discount);
  const t = calculateTotal(cart, 5, discount);
  const [load, setLoad] = useState(false);
  const [c, setC] = useState(false);
  const [form, setForm] = useState({});
  let l = window.location.search;
  const time = useSelector((state) => state.time);

  const addPayment = (e) => {
    e.preventDefault();
    setLoad(true);
    window.parent.postMessage(
      JSON.stringify({
        type: "submit",
        products: JSON.stringify([
          ...cart,
          { name: "fee", img: "", price: t.fee, id: "727430761" },
          { name: "discount", img: "", price: t.dis, id: "727430762" },
        ]),
        data: form,
      }),
      "*"
    );
    setC(true);
  };

  useEffect(() => {
    if (c) {
      setTimeout(() => {
        setLoad(false);
        setOpen(false);
      }, 1000);
    }
  }, [c, l, setOpen]);

  return (
    <div className={`w100 df aic jcc modal-container ${open && "open"}`}>
      <div className="df fdc aic gap10 modal-content">
        <p className="w100 df aic jcc gap10 fs12 ticket-time">
          <MdOutlineAccessTime className="fs18" />
          Time left to place your order: <CountdownTimer initialTime={time} />
        </p>
        <div className="w100 df fdc aic gap10 modal-info">
          <div className="w100 df aic jcsb _info-title">
            <p className="fs22">YOUR TICKETS</p>
            <span className="fs18 cp" onClick={() => setOpen(false)}>
              <RxCross2 />
            </span>
          </div>
          <div className="w100 df aic fww gap10 tags">
            {cart?.map((chair, ind) => {
              return (
                <label
                  className="df aic gap10  fs12 tag"
                  key={`${chair?.seats}_${ind}`}>
                  {generateIcon(chair?.type, chair?.color)}
                  {chair?.type === "stand" ? (
                    `Dancefloor × ${chair.quantity}`
                  ) : (
                    <>
                      {chair?.row} {chair?.seats}
                    </>
                  )}
                </label>
              );
            })}
          </div>
          {discount > 0 && (
            <p className="w100 df aic jcsb" style={{ color: "#53BC6B" }}>
              <span className="fs12">PROMOCODE -{discount}%:</span>
              <i className="fs12">
                <b>{t?.dis || 0} €</b>
              </i>
            </p>
          )}
          <p className="w100 df aic jcsb" style={{ color: "#f8f5ec80" }}>
            <span className="fs12">transaction fee 5%:</span>
            <i className="fs12">
              <b>{t?.fee || 0} €</b>
            </i>
          </p>
          <p className="w100 df aic jcsb">
            <span className="fs14">Total:</span>
            <i className="fs14">
              <b>{t.total || 0} €</b>
            </i>
          </p>
          <form
            className="w100 df fdc aic gap10  _info-form"
            onSubmit={addPayment}>
            <InputComponent
              type="text"
              name="Name"
              onChange={(e) => setForm({ ...form, Name: e.target.value })}
            />
            <InputComponent
              type="email"
              name="Email"
              onChange={(e) => setForm({ ...form, Email: e.target.value })}
            />
            <InputComponent
              type="tel"
              name="Phone"
              onChange={(e) => setForm({ ...form, Phone: e.target.value })}
            />
            <label className="w100 df aic gap8 fs12 checkbox">
              <ConfigProvider
                theme={{
                  token: {
                    colorWhite: "#2c2c2b",
                  },
                }}>
                <Checkbox
                  defaultChecked
                  style={{ opacity: 0.3, transform: "scale(0.8)" }}
                />
              </ConfigProvider>
              <p>
                Checkbox txt on one line to <u>show</u> what it will.
              </p>
            </label>
            <button
              className={`w100 df aic jcc gap10 fs16 basket-btn ${
                form.Name?.length &&
                form.Phone?.length &&
                form.Email?.length &&
                " active"
              }`}
              disabled={cart?.length === 0}>
              <i>BUY TICKET</i>
              {load && <BiLoaderCircle className="svg-loader fs18" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CartModal;

export const PromoCode = () => {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const checkPromo = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (code === "UVENTY2024") {
        setStatus(1);
        dispatch(acDiscount("SET_DISCOUNT", 5));
        setLoading(false);
      } else {
        setStatus(0);
        setLoading(false);
      }
    }, 1000);
  };

  const cancel = () => {
    setCode("");
    setStatus(null);
    dispatch(acDiscount("SET_DISCOUNT", 0));
  };

  return (
    <div className="w100 df fdc promo-container">
      <form className="w100 df aic gap5 promo-box" onSubmit={checkPromo}>
        {status !== null && <RxCross2 className="fs16 cp" onClick={cancel} />}
        <input
          type="text"
          placeholder="enter promo code"
          className="fs12"
          style={{
            color: status ? "#53BC6B" : status === 0 ? "#F66969" : "#F8F5EC",
          }}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          className={`df aic jcc cp ${
            (status === 0 || code?.length === 0) && "passive"
          } ${status === 1 && "success"}`}
          disabled={status === 1 || code?.length === 0}>
          {loading ? (
            <BiLoaderCircle className="svg-loader fs16" />
          ) : status === 1 ? (
            <BsCheckLg className="fs18" />
          ) : (
            <FiArrowRight className="fs16" />
          )}
        </button>
      </form>
      {status === 0 && (
        <p className="fs10" style={{ color: "#F66969" }}>
          Promo code is wrong
        </p>
      )}
    </div>
  );
};

export const calculateTotal = (data, percentage, discount) => {
  let totalQuantity = 0;
  const total = data?.reduce((acc, curr) => {
    if (curr?.type === "stand") {
      totalQuantity += curr?.quantity;
    } else {
      totalQuantity += 1;
    }
    return (
      acc +
      (curr?.type === "stand" ? curr?.price * curr?.quantity : curr?.price)
    );
  }, 0);

  const fee = (total / 100) * percentage;
  const roundedFee = (Math.ceil(fee * 100) / 100).toFixed(2);
  const totalDiscount = (total / 100) * discount || 0;

  return {
    total: (total + +roundedFee - totalDiscount).toFixed(2),
    fee: roundedFee,
    dis: totalDiscount?.toFixed(2),
    qty: totalQuantity,
  };
};

export const CountdownTimer = ({ initialTime, action }) => {
  const [time, setTime] = useState(initialTime);
  const dispatch = useDispatch();

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime === 0) {
          clearInterval(interval);
          return 0;
        }
        return prevTime - 1;
      });
      dispatch(acTimer(time));
      if (time === 0) {
        localStorage.removeItem("cart");
        action((prev) => !prev);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [action, dispatch, time]);

  // Zamanı biçimlendirerek ekrana yazdıralım
  const formatTime = (time) => {
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return <span style={{ width: "45px" }}>{formatTime(time)}</span>;
};

export const getSeats = (cart, category) => {
  return cart.reduce((acc, curr) => {
    if (curr.category === category) {
      acc.push(curr);
    }
    return acc;
  }, []);
};

export const getUniqueCategory = (data) => {
  return data.reduce((acc, curr) => {
    if (!acc.includes(curr.category)) {
      acc.push(curr.category);
    }
    return acc;
  }, []);
};

export const findMinMaxPrices = (data = []) => {
  if (data?.length === 0) {
    return { min: 0, max: 0, totalLeft: 0 };
  }

  let min = data[1]?.price;
  let max = data[1]?.price;
  let totalLeft = 0;

  data?.forEach((item) => {
    if (item?.price < min) {
      min = item?.price;
    }
    if (item?.price > max) {
      max = item?.price;
    }
    totalLeft += item?.seats;
  });

  return { min, max, totalLeft };
};
