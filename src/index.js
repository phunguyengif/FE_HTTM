import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client"; // Import đúng cho React 18
import "./index.css";
import App from "./App";

import { Provider } from "react-redux";
import catsReducer from "./redux/slices/catSlice";
import productReducer from "./redux/slices/productsSlice";
import discountsReducer from "./redux/slices/discountsSlice";
import revenuesReducer from "./redux/slices/revenuesSlice";
import ordersReducer from './redux/slices/orderSlice';
import catSaga from "./redux/sagas/catSaga";
import createSagaMiddleware from "redux-saga";
import { configureStore } from "@reduxjs/toolkit";
import "./assets/css/styles.css";
import "./assets/scss/styles.scss";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

const saga = createSagaMiddleware();

const store = configureStore({
  reducer: {
    cats: catsReducer,
    products: productReducer,
    discounts: discountsReducer,
    revenues: revenuesReducer,
    orders: ordersReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(saga), // sử dụng function
});

saga.run(catSaga);



export function SliderController({ intervalTime = 3000, maxSlides = 4 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const sliderContent = document.querySelector('.slider-content-left-top');
    const sliderBotton = document.querySelectorAll('.slider-content-left-botton li');
    console.log("content:::", sliderContent);
    console.log("contentBotton:::", sliderBotton);
    if (sliderContent) {
      sliderContent.style.left = `-${index * 100}%`;
    }
    if (sliderBotton) {
      Removeactive();
      sliderBotton[index].classList.add("active");
    }
    function Removeactive() {
      const ImangeActive = document.querySelector('.active');
      if (ImangeActive) {
        ImangeActive.classList.remove("active");
      }
    }
  }, [index]);
  useEffect(() => {
    const titleItems = document.querySelectorAll('.slider-content-left-botton li');
    titleItems.forEach((item, i) => {
      item.addEventListener('click', () => {
        Removeactive();
        item.classList.add("active")
        setIndex(i);
      });
    });
    function Removeactive() {
      const ImangeActive = document.querySelector('.active');
      if (ImangeActive) {
        ImangeActive.classList.remove("active");
      }
    }

    return () => {
      titleItems.forEach((item) => {
        item.removeEventListener('click', () => { });
      });
    };
  }, [index]);
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex < maxSlides ? prevIndex + 1 : 0));
    }, intervalTime);

    return () => clearInterval(interval);
  }, [intervalTime, maxSlides, index]);

  const handleRightClick = () => {
    setIndex((prevIndex) => (prevIndex < maxSlides ? prevIndex + 1 : 0));
  };

  const handleLeftClick = () => {
    setIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    if (index === 0) {
      setIndex(maxSlides);
    }
  };

  useEffect(() => {
    const leftBtn = document.querySelector('.btn-left');
    const rightBtn = document.querySelector('.btn-right');
    console.log(rightBtn)
    if (rightBtn) {
      rightBtn.addEventListener('click', handleRightClick);
    }
    if (leftBtn) {
      leftBtn.addEventListener('click', handleLeftClick);
    }
    return () => {
      if (rightBtn) {
        rightBtn.removeEventListener('click', handleRightClick);
      }
      if (leftBtn) {
        leftBtn.removeEventListener('click', handleLeftClick);
      }
    };
  }, [handleLeftClick, handleRightClick]);

  return null; 
}
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
