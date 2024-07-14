import React, { useState, useMemo, Suspense, lazy } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { calculateTotal, findMinMaxPrices, getSeats } from "./utility";
import { getUniqueCategory, CountdownTimer, PromoCode } from "./utility";
import { generateSeat } from "./generate-fileld";
import { mainData, data, categories, generateIcon } from "./generate-fileld";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useControls } from "react-zoom-pan-pinch";

import { FaCheck } from "react-icons/fa6";
import { RiZoomInLine, RiZoomOutLine } from "react-icons/ri";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { RiArrowGoBackLine } from "react-icons/ri";
import { RxPlus, RxMinus, RxCross2 } from "react-icons/rx";
import { MdOutlineAccessTime } from "react-icons/md";
import birds from "./images/EARLY BIRDS.svg";
import arrow from "./images/Frame 6282.svg";
import { useSelector } from "react-redux";

const CartModal = lazy(() => import("./utility"));

export const App = () => {
  const [update, setUpdate] = useState(false);
  const [activeSeat, setActiveSeat] = useState(null);
  const cart = useMemo(
    () => JSON.parse(localStorage.getItem("cart")) || [],
    [update]
  );
  const [selected, setSelected] = useState(0);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(true);
  const [openB, setOpenB] = useState(false);
  const [cartModal, setCartModal] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [firstZ, setFirstZ] = useState(true);
  const [cursor, setCursor] = useState("grab");
  const discount = useSelector((state) => state.discount);

  useEffect(() => {
    const updateZoom = () => {
      setMobile(window.innerWidth <= 768);
      setZoom(window.innerWidth <= 768 ? 0.8 : 1);
    };
    updateZoom();
    window.addEventListener("resize", updateZoom);
    return () => window.removeEventListener("resize", updateZoom);
  }, []);

  const addToCart = useCallback(
    (seat, st) => {
      setUpdate(!update);
      const cartItem = cart.find((x) => x.id === seat.id);
      if (cartItem) {
        if (seat.category === "DANCE FLOOR") {
          if (st) {
            if (cartItem.quantity === 1) {
              cart.splice(cart.indexOf(cartItem), 1);
            } else {
              cartItem.quantity--;
            }
          } else {
            cartItem.quantity++;
          }
          localStorage.setItem("cart", JSON.stringify(cart));
          return;
        }
        cart.splice(cart.indexOf(cartItem), 1);
        localStorage.setItem("cart", JSON.stringify(cart));
      } else {
        if (seat.category === "DANCE FLOOR") {
          cart.push({ ...seat, quantity: 1 });
          localStorage.setItem("cart", JSON.stringify(cart));
          return;
        }
        cart.push(seat);
        localStorage.setItem("cart", JSON.stringify(cart));
      }
    },
    [cart, update]
  );
  const deleteFromCart = useCallback(
    (category) => {
      setUpdate(!update);
      const ds = cart.filter((item) => item.category !== category);
      localStorage.setItem("cart", JSON.stringify(ds));
    },
    [cart, update]
  );

  const handleMouseDown = useCallback((e) => {
    setCursor("grabbing");
  }, []);

  const handleUp = useCallback(() => {
    setCursor("grab");
  }, []);

  const Controls = () => {
    const { zoomIn, zoomOut, resetTransform } = useControls();
    return (
      <>
        {" "}
        <div className="df aic gap5 zoom-box cp">
          <button
            className="df aic jcc fs18"
            onClick={() => {
              zoomOut();
              setZoom(zoom - 1);
            }}
            disabled={zoom <= 1}>
            <RiZoomOutLine />
          </button>
          <button
            className="df aic jcc fs18"
            onClick={() => {
              zoomIn();
              setZoom(zoom + 1);
            }}
            disabled={zoom >= 10}>
            <RiZoomInLine />
          </button>
        </div>
        {cart.length !== 0 && (
          <div className="df aic jcc gap10 zoom-box time-box" id="action">
            <MdOutlineAccessTime className="fs18" /> Time left to place your
            order: {<CountdownTimer initialTime={900} action={setUpdate} />}
          </div>
        )}
        {(zoom > 1 || categories[selected].type !== "all") && (
          <div
            className="df aic jcc back-btn cp"
            onClick={() => {
              setOpen(false);
              resetTransform();
              setZoom(1);
              setFirstZ(true);
              setSelected(0);
              setActive(0);
            }}
            id="action">
            <button className="df aic jcc fs18">
              <RiArrowGoBackLine />
            </button>
          </div>
        )}
        {categories[selected].type !== "all" && (
          <span
            className="df aic jcc fs12 cp bottom-back-btn"
            onClick={() => {
              setSelected(0);
              setActive(0);
              setOpen(false);
            }}
            id="action">
            BACK TO ALL <br /> CATEGORIES
          </span>
        )}
      </>
    );
  };

  const firstZoom = useCallback(
    (e) => {
      if (firstZ && zoom <= 1) {
        const doubleClickEvent = new MouseEvent("dblclick", {
          bubbles: true,
          cancelable: true,
          clientX: e.changedTouches?.[0]?.clientX || e?.clientX,
          clientY: e.changedTouches?.[0]?.clientY || e?.clientY,
        });
        e?.currentTarget?.dispatchEvent(doubleClickEvent);
        setFirstZ(false);
      }
    },
    [firstZ, zoom]
  );

  const closeModal = () => {
    setOpenB(false);
    setOpen(false);
  };

  const selectActiveSeat = (e, seat) => {
    e.stopPropagation();
    if (seat.status === "available" && !mobile) {
      addToCart(seat);
    }
    if (mobile) {
      setActiveSeat(seat?.id);
    }
  };

  const cancel = (e) => {
    if (
      e?.target?.offsetParent?.className === "ant-tooltip-content" ||
      e.target.tagName === "path"
    ) {
      console.log("calismadi");
    } else {
      setActiveSeat(null);
    }
  };
  const totalC_V = useMemo(() => findMinMaxPrices(categories), [categories]);
  const total = calculateTotal(cart, 5, discount);
  return (
    <div className="w100 gap15 wrapper">
      <TransformWrapper
        initialScale={1}
        initialPositionX={0}
        initialPositionY={0}
        wheel={{ wheelDisabled: true }}>
        {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
          <div
            className={`df aic jcc chairs-container  ${
              activeSeat && "show-off"
            }`}
            style={{ cursor: cursor }}
            onMouseDown={closeModal}
            onTouchStart={closeModal}
            onTouchEndCapture={cancel}
            onDoubleClick={() => setZoom(zoom + 1)}>
            <>
              <Controls />
              <TransformComponent>
                <div className="ccc">
                  <div
                    className="df fdc aic gap10 chairs-body"
                    onClick={firstZoom}
                    onTouchEnd={firstZoom}
                    onTouchMove={firstZoom}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleUp}
                    style={{ transform: `scale(${mobile ? 0.9 : 1})` }}>
                    <label className="w100 df aic jcc fs10 stage">STAGE</label>
                    {mainData.map((row, ind) => {
                      if (row.name === "dance_floor") {
                        const seats = getSeats(cart, "DANCE FLOOR");
                        const danceD = {
                          id: ind,
                          category: "DANCE FLOOR",
                          name: "DANCE FLOOR",
                          img: "",
                          price: 50.2,
                          currency: "€",
                          color: "#53BC6B",
                          type: "stand",
                        };
                        return (
                          <div
                            className={`df fdc aic jcc gap10 cp dance-floor ${
                              categories[active].type !== "all"
                                ? categories[active].type !== "stand"
                                  ? "passive"
                                  : ""
                                : ""
                            }`}
                            key={"dance-floor" + ind}
                            onClick={() => {
                              if (activeSeat) {
                                setActiveSeat(null);
                                return;
                              }
                              if (!seats?.length) {
                                addToCart(danceD, ind);
                              }
                            }}>
                            <p className="df aic gap5 fs12">
                              {seats?.length !== 0 && <FaCheck />}
                              DANCE FLOOR
                            </p>
                            {seats?.length !== 0 && (
                              <div className="df aic fs12 counter">
                                <span
                                  className="df aic jcc"
                                  onClick={() => addToCart(danceD, true)}>
                                  <RxMinus />
                                </span>
                                <i className="df aic jcc">
                                  {seats?.[0]?.quantity}
                                </i>
                                <span
                                  className="df aic jcc"
                                  onClick={() => addToCart(danceD)}>
                                  <RxPlus />
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      } else {
                        return (
                          <div
                            className="w100 df fdc aic seats-box"
                            key={`${row.name}_${ind}`}>
                            {row.seats.map((seat, index) => (
                              <div
                                key={`${seat.name}_${index}`}
                                className="df aic seat-row">
                                <big className="title-row">{seat?.name}</big>
                                {data.map((seatData) => {
                                  if (seatData.row === seat.name) {
                                    const s = cart?.some(
                                      (x) => x?.id === seatData?.id
                                    );
                                    const cl =
                                      categories[active].name ===
                                      "All CATEGORIES"
                                        ? seatData?.color
                                        : categories[active].name ===
                                          seatData.category
                                        ? seatData?.color
                                        : "#57534E";
                                    return (
                                      <div
                                        key={`${seatData?.id}_${index}`}
                                        className={`chair fs18 ${
                                          activeSeat === seatData?.id &&
                                          "active-seat"
                                        }`}
                                        style={{ color: cl }}
                                        onClick={(e) =>
                                          selectActiveSeat(e, seatData)
                                        }>
                                        {generateSeat(
                                          seatData,
                                          s,
                                          cl,
                                          addToCart,
                                          mobile,
                                          setActiveSeat,
                                          activeSeat
                                        )}
                                      </div>
                                    );
                                  } else {
                                    return null;
                                  }
                                })}
                                <big className="title-row">{seat?.name}</big>
                              </div>
                            ))}
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
              </TransformComponent>
            </>
          </div>
        )}
      </TransformWrapper>
      <div
        className="df fdc aic gap10 sidebar-filter"
        onClick={() => setOpenB(openB ? false : openB)}>
        <div className="w100 df aic jcsb">
          <p className="fs22">CATEGORIES:</p>
          {categories[selected]?.old_price && (
            <p className="df aic gap5 fs12">
              <span style={{ color: "#aaa" }}>old price:</span>
              <span style={{ color: "#ddd", width: "47px" }}>new price:</span>
            </p>
          )}
        </div>
        <div className="w100 df fdc aic select-component">
          <div
            className={`w100 df aic gap10 cp component-label ${
              (open || selected) && "shadow-none"
            }`}
            onClick={() => setOpen(!open)}>
            <p className="df aic fs14 gap5">
              <span
                style={{ textTransform: "uppercase" }}
                className="df aic gap5 drop-down-title">
                {generateIcon(
                  categories[selected]?.type,
                  categories[selected]?.color,
                  "small"
                )}
                {categories[selected].name}{" "}
              </span>{" "}
              <i
                className="fs12"
                style={{ color: "#f8f5ec4d", fontWeight: "bold" }}>
                {totalC_V?.totalLeft} <i>left</i>
              </i>
            </p>
            {selected === 0 ? (
              <i
                className="df aic fs12 gap5"
                style={{ color: "#f8f5ec4d", fontWeight: "bold" }}>
                {!mobile && "from"}
                <b className="fs14" style={{ color: "#F8F5EC" }}>
                  {totalC_V?.min} €
                </b>{" "}
                {!mobile && "to"}
                {mobile && <b>-</b>}
                <b className="fs14" style={{ color: "#F8F5EC" }}>
                  {totalC_V?.max} €
                </b>
              </i>
            ) : (
              <p
                className="df aic gap10"
                style={{
                  color: "#f8f5ec4d",
                  fontWeight: "bold",
                  width: "auto",
                }}>
                {categories[selected]?.early_bird && (
                  <img src={birds} alt="birds" className="early-birds" />
                )}
                {categories[selected]?.old_price && (
                  <del className="fs12">{categories[selected].old_price} €</del>
                )}
                <b style={{ color: "#f8f5ec80" }} className="fs14 price">
                  {categories[selected].price} €
                </b>
              </p>
            )}
          </div>
          <div className={`w100 df fdc component-body ${!open && "close"}`}>
            {categories.map(
              (category, ind) =>
                categories[selected].id !== category.id && (
                  <label
                    key={category.id}
                    className={`w100 df aic jcsb gap5 component-option ${
                      category?.type === "all" && "all"
                    }`}
                    onClick={() => {
                      setSelected(ind);
                      setActive(ind);
                      setOpen(false);
                    }}
                    onMouseEnter={() => setActive(ind)}
                    onMouseLeave={() =>
                      setActive(selected !== 0 ? selected : 0)
                    }>
                    <p className="df aife gap5 fs14">
                      <span
                        className="df aic gap5 drop-down-title option"
                        style={{ textTransform: "uppercase" }}>
                        {generateIcon(category?.type, category?.color, "small")}
                        {category.name}{" "}
                      </span>
                      <i
                        className="fs12"
                        style={{ color: "#f8f5ec4d", fontWeight: "bold" }}>
                        {category.seats} left
                      </i>
                    </p>
                    <i
                      className="df aife gap10"
                      style={{ color: "#f8f5ec4d", fontWeight: "bold" }}>
                      {category?.early_bird && (
                        <img src={birds} alt="birds" className="early-birds" />
                      )}
                      {category?.old_price && (
                        <del className="fs12">
                          {category.old_price} {category?.currency}
                        </del>
                      )}
                      <b
                        style={{
                          color: "#f8f5ec80",
                          width: "60px",
                          textAlign: "end",
                        }}
                        className="fs14">
                        {category.price} {category.price && category?.currency}
                      </b>
                    </i>
                  </label>
                )
            )}
            {mobile && (
              <span
                className="df aic fs18 select-arrow"
                style={{ color: "#f8f5ec4d" }}
                onClick={() => setOpen(!open)}>
                {open ? <IoIosArrowUp /> : <IoIosArrowDown />}
              </span>
            )}
          </div>
        </div>
        {!mobile && (
          <span
            className="df aic jcc fs18 cp mobile-arrow"
            style={{ color: "#f8f5ec4d" }}
            onClick={() => setOpen(!open)}>
            {open ? <IoIosArrowUp /> : <IoIosArrowDown />}
          </span>
        )}
      </div>
      <div
        className={`df fdc basket-box ${mobile && openB && "open"}`}
        onClick={(e) => {
          if (e.target.tagName !== "BUTTON") {
            setOpenB(true);
          }
          console.log(e.target.tagName);
          if (e.target.tagName === "svg" || e.target.tagName === "LABEL") {
            setOpenB(!openB);
          }
          setOpen(open ? false : open);
        }}>
        <p className="w100 fs22">YOUR ORDER:</p>
        <div className="w100 df fdc aic gap25 basket-body">
          {getUniqueCategory(cart).length ? (
            getUniqueCategory(cart).map((category, ind) => {
              const seats = getSeats(cart, category);
              return (
                <div className="w100 df fdc gap10" key={`${category}_${ind}`}>
                  <div
                    className="w100 df aic jcsb basket-header"
                    style={{
                      borderBottom: `1px solid ${seats?.[0]?.color}99`,
                      paddingBottom: "8px",
                    }}>
                    <p
                      className="df aic gap10 fs14"
                      style={{ textTransform: "uppercase" }}>
                      {generateIcon(seats?.[0]?.type, seats?.[0]?.color)}
                      {category}{" "}
                      <span
                        style={{ color: "#f8f5ec4d" }}
                        className="df aic gap10 fs12">
                        <RxCross2 className="fs9" />{" "}
                        {category === "DANCE FLOOR"
                          ? seats?.[0]?.quantity
                          : seats.length}
                      </span>
                    </p>
                    <p className="df aic gap10 fs14">
                      {category === "DANCE FLOOR"
                        ? seats
                            ?.reduce(
                              (acc, curr) => acc + curr?.price * curr?.quantity,
                              0
                            )
                            ?.toFixed(2)
                        : seats
                            ?.reduce((acc, curr) => acc + curr?.price, 0)
                            ?.toFixed(2)}
                      {seats?.[0]?.currency || "€"}
                      <span
                        className="cp fs14 delete-btn"
                        onClick={() => deleteFromCart(category)}>
                        <RxCross2 className="fs12" />
                      </span>
                    </p>
                  </div>
                  <div className="w100 df fdc gap5">
                    {seats.map((seat, index) => {
                      return (
                        <label
                          key={`${seat.seats}_${index}`}
                          className="w100 df aic jcsb basket-item">
                          <p
                            className="df aic gap10 fs14"
                            style={{ color: "#f8f5ec4d" }}>
                            {category === "DANCE FLOOR" ? (
                              "Quantity:"
                            ) : (
                              <>
                                <span className="df aic gap10">
                                  Row:{" "}
                                  <span style={{ color: "#f8f5ec" }}>
                                    {seat.row}
                                  </span>
                                </span>
                                <span className="df aic gap10">
                                  Seat:{" "}
                                  <span style={{ color: "#f8f5ec" }}>
                                    {seat.seats}
                                  </span>
                                </span>
                              </>
                            )}
                          </p>
                          <i
                            className="df aic gap10 fs10"
                            style={{ color: "#f8f5ec4d" }}>
                            {category !== "DANCE FLOOR" && (
                              <b>
                                {seat.price} {seat.currency}
                              </b>
                            )}
                            <span className="cp fs14 delete-btn">
                              {category === "DANCE FLOOR" ? (
                                <span className="df aic gap5">
                                  <RxMinus
                                    onClick={() => addToCart(seat, true)}
                                  />
                                  {seat.quantity}
                                  <RxPlus onClick={() => addToCart(seat)} />
                                </span>
                              ) : (
                                <span onClick={() => addToCart(seat)}>
                                  <RxCross2 className="fs12" />
                                </span>
                              )}
                            </span>
                          </i>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <span style={{ color: "#aaa", margin: "auto" }} className="fs12">
              Select a ticket
            </span>
          )}
        </div>
        <PromoCode />
        <div className="w100 df fdc gap5 basket-footer">
          <div className="w100 df fdc gap5 price-info">
            <p className="w100 df aic jcsb price-info-mobile-title">
              <i className="fs14">Selected tickets:</i>
              <i className="fs14">
                <b>{total?.total || 0}</b>
              </i>
            </p>
            {discount > 0 && (
              <p className="w100 df aic jcsb fs10" style={{ color: "#53BC6B" }}>
                <span>PROMOCODE -{discount}%:</span>
                <i>
                  <b>-{total?.dis || 0} €</b>
                </i>
              </p>
            )}
            <p className="w100 df aic jcsb fs10" style={{ color: "#f8f5ec4d" }}>
              <span>transaction fee 5%:</span>
              <i>
                <b>{total?.fee || 0} €</b>
              </i>
            </p>
            <p className="w100 df aic jcsb">
              <i className="fs14">Total price:</i>
              <i className="fs14">
                <b>{total?.total || 0} €</b>
              </i>
            </p>
          </div>
          <button
            className={`w100 fs16 basket-btn ${
              getUniqueCategory(cart)?.length ? "active" : ""
            }`}
            id="buy-ticket"
            onClick={() => {
              if (getUniqueCategory(cart).length) setCartModal(true);
            }}>
            BUY TICKET
          </button>
        </div>
        <label
          className="df aic jcc gap5 fs12 cp basket-arrow"
          style={{ color: "#f8f5ec4d" }}>
          <img src={arrow} alt="icon" className={`img ${openB && "down"}`} />{" "}
          <label style={{ fontWeight: "bold" }}>MORE DETAILS</label>
        </label>
      </div>
      {cartModal && (
        <Suspense>
          <CartModal setOpen={setCartModal} open={cartModal} />
        </Suspense>
      )}
    </div>
  );
};
