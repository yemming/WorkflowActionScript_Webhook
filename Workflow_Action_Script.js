/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 * @NModuleScope SameAccount
 * @description
 * [優化版] - 這個版本在原始的「終極整合版」基礎上，增加了更強的除錯(Debug)能力。
 * 它會先嘗試解析(Parse)由 Workflow 公式產生的 JSON 字串，
 * 確保它是一個合法的 JSON 格式，然後才發送出去。
 * 如果格式錯誤，它會留下詳細的錯誤日誌，幫助你快速定位問題。
 */
define(['N/https', 'N/log', 'N/runtime'], function (https, log, runtime) {

    function onAction(context) {
        try {
            // --- 步驟 1: 取得基本資料 ---
            const script = runtime.getCurrentScript();
            const currentRecord = context.newRecord;
            const recordId = currentRecord.id;
            const recordType = currentRecord.type;

            log.debug(`工作流觸發成功 (紀錄 ${recordType}:${recordId})`, '準備發送 HTTP 請求...');

            // --- 步驟 2: 從腳本參數取得目標 URL 和 Payload 內容 ---
            const targetUrl = script.getParameter({ name: 'custscript_wf_webhook_url' });
            const payloadString = script.getParameter({ name: 'custscript_wf_payload_template' });

            // --- 步驟 3: 基本檢查，確保參數都設定了 ---
            if (!targetUrl) {
                log.error('設定錯誤', "你忘了在 Workflow Action 上設定 'custscript_wf_webhook_url' 參數！腳本終止。");
                return;
            }
            if (!payloadString) {
                log.error('設定錯誤', "你忘了在 Workflow Action 上設定 'custscript_wf_payload_template' 參數了！腳本終止。");
                return;
            }

            // --- 步驟 4 (優化重點): 驗證並記錄 Payload ---
            // 在發送前，先把你辛苦寫的公式所產生的字串，攤在陽光下仔細檢查。
            log.debug({
                title: '從工作流公式取得的原始 Payload 字串',
                details: payloadString
            });

            // 嘗試將字串解析為 JSON 物件，這是為了驗證你的公式是否完美無瑕。
            try {
                JSON.parse(payloadString);
            } catch (jsonError) {
                // 如果解析失敗，代表你的公式可能少了個逗號或引號，導致 JSON 格式不正確。
                // 我們在這裡留下詳細的錯誤報告，然後停止發送，避免把錯誤的資料送出去。
                log.error({
                    title: 'Payload 公式產生了無效的 JSON!',
                    details: {
                        errorMessage: '你的 Workflow 公式產生的字串不是一個合法的 JSON，請檢查公式中的引號、逗號和括號。',
                        jsonError: jsonError.message,
                        problematicString: payloadString // 把有問題的字串完整印出來，方便你複製去檢查
                    }
                });
                return; // 終止腳本
            }

            // --- 步驟 5: 直接發送 POST 請求 ---
            // 彈藥檢查完畢，確認是良品，可以發射了！
            const response = https.post({
                url: targetUrl,
                body: payloadString,
                headers: { 'Content-Type': 'application/json' }
            });

            // --- 步驟 6: 把外部伺服器的回應結果記錄下來 ---
            log.audit({
                title: `外部請求完成 (紀錄 ${recordType}:${recordId})`,
                details: {
                    sentUrl: targetUrl,
                    sentPayload: payloadString,
                    httpStatusCode: response.code,
                    responseBody: response.body
                }
            });

        } catch (e) {
            log.error('腳本執行時發生未知錯誤', {
                errorMessage: e.message,
                stack: e.stack
            });
        }
    }

    return {
        onAction: onAction
    };
});
