"use strict"
import { URLSearchParams } from 'url'
const { v4: uuidv4 } = require('uuid')

// LINE Pay API SDK の初期化
const line_pay = require("../line-pay/line-pay")
const useCheckout = process.env.VUE_LINE_PAY_USE_CHECKOUT === "true" ? true : false
const pay = new line_pay({
    channelId: process.env.VUE_LINE_PAY_CHANNEL_ID,
    channelSecret: process.env.VUE_LINE_PAY_CHANNEL_SECRET,
    isSandbox: !useCheckout
});
const PAY_PRODUCT_NAME = "LINE Payハンズオン"
const APP_HOST_NAME = process.env.VUE_APP_HOST_NAME

exports.handler = async function(event) {
    const body = event.body
    let params = new URLSearchParams(body)
    const type = params.get('type')
  
    const headers = {
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Content-Type': 'application/json'
    }

    if (type === 'reserve') {
        const products = [
            {
                id: "handson",
                name: "ハンズオン",
                imageUrl: process.env.VUE_APP_LINE_PAY_IMAGE_URL,
                quantity: 1,
                price: 10
    
            }
        ]
    
        const packages = [
            {
                id: "package_id",
                amount: 10,
                name: PAY_PRODUCT_NAME,
                products: products
            }
        ]
        // 決済予約
        let options = {
            amount: 10,                 // 金額（この場合は10円）
            currency: "JPY",           // 日本円
            orderId: uuidv4(),

            packages: packages,
            redirectUrls: {
                confirmUrl: `${APP_HOST_NAME}/pay/confirm`,
                confirmUrlType: "SERVER",
                cancelUrl: `${APP_HOST_NAME}/pay/cancel`,
            },
            options: {
                display: {
                    locale: "ja",
                    checkConfirmUrlBrowser: false
                },
                payment: {
                    capture: true
                }
            }
        }
        let myBody;
        await pay.reserve(options).then((response) => {
            let reservation = options
            reservation.transactionId = response.info.transactionId
            reservation.paymentUrl = response.info.paymentUrl.web
            myBody = JSON.stringify(reservation);
        })

        return {
            statusCode: 200,
            body: myBody,
            headers: headers
        }

    } else if (type === 'confirm') {
        // 決済処理
        const transactionId = params.get('transactionId')
        const reservations = JSON.parse(params.get('reservations'))
    
        let confirmation = {
            transactionId: transactionId,
            amount: reservations.amount,
            currency: reservations.currency
        }
    
        await pay.confirm(confirmation).then((response) => {
        })

        return {
            statusCode: 200,
            body: '決済完了しました！',
            headers: headers
        }

    } else {
        return {
            statusCode: "400",
            body: 'APIエラー',
            headers: headers
        }
    }
}