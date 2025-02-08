"use client";
import React, { useState } from "react";
import "./globals.css";

export default function PurchaseForm() {
  const [prd_id, setPrd_id] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState(null);
  const [purchaseList, setPurchaseList] = useState([]);
  const [errorMessage, setErrorMessage] = useState(""); // エラーメッセージを保持

  // 「商品コード 読み込み」ボタン押下時にAPIを呼び出して情報を取得
  const handleFetchItem = async () => {
    if (!code || code.trim() === "") {
      setErrorMessage('商品コードを入力してください');
      return;
    }
    try {
      const res = await fetch(`${process.env.API_ENDPOINT}/search?code=${code}`);
      if (!res.ok) {
        throw new Error('サーバーエラーが発生しました');
      }
      const data = await res.json();

      if (!data) {
        throw new Error('商品がマスタ未登録です');
      }

      setPrd_id(data.prd_id);
      setCode(data.code);
      setName(data.name);
      setPrice(data.price);
      setErrorMessage(""); // エラーメッセージをクリア
      } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleAddItem = () => {
    if (name && price > 0) {
      setPurchaseList([
        ...purchaseList,
        { 
          id: Date.now(), // 一意なキーを追加
          prd_id: prd_id,
          prd_code: code,
          prd_name: name,
          prd_price: price
        },
      ]);
      setName('');
      setPrice(null);
      setCode('');
    }
  };

  const handlePurchase = async () => {
    const res = await fetch(process.env.API_ENDPOINT + '/purchases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    if (!res.ok) {
      throw new Error('サーバーエラーが発生しました');
    }

    // trd_id を取得
    const { trd_id } = await res.json();

    // purchaseList に trd_id を付加
    const updatedPurchaseList = purchaseList.map(item => ({
      ...item,
      trd_id
    }));

    const response = await fetch(process.env.API_ENDPOINT + '/purchase_details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedPurchaseList),
    });

    // const total_amt = updatedPurchaseList.reduce((sum, item) => sum + item.prd_price * 1, 0);
    let total_amt = 0;
    updatedPurchaseList.forEach(item => {
      total_amt += Math.floor(Number(item.prd_price));
  });

    const total = await fetch(process.env.API_ENDPOINT + '/purchases', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
    },
      body: JSON.stringify({ trd_id, total_amt }),
    });
    if (!total.ok) {
      throw new Error('サーバーエラーが発生しました');
    }

    alert(`合計金額（税込）は${total_amt}円です`);

    setPurchaseList([]);
  };

  return (
    <div className="container">
      <div className="input_section">
        <input
          type="text"
          className="code_input"
          name="code"
          placeholder="商品コードを入力"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button className="button" onClick={handleFetchItem}>
          商品コード 読み込み
        </button>
      </div>

      <div className="item_container">
        {errorMessage ? <p className="error">{errorMessage}</p> : <p>{name}</p>}
      </div>

      <div className="price_container">
        {price !== null && price > 0 ? <p>{price}円</p> : null}
      </div>

      <button className="button" onClick={handleAddItem}>
        追加
      </button>

      <h3>購入リスト</h3>
      <div className="item_list_container">
        <ul>
          {purchaseList.map((item) => (
            <li key={item.id}>
              {item.prd_name} x1 {item.prd_price}円 {Number(item.prd_price)}円
            </li>
          ))}
        </ul>
      </div>

      <button className="button" onClick={handlePurchase}>
        購入
      </button>
    </div>
  );
}