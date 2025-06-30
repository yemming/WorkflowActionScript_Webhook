### NetSuite 部份

1. 下載這個NetSuite的原始檔：https://github.com/yemming/WorkflowActionScript_Webhook/blob/main/Workflow_Action_Script.js
2. 到你的NetSuite帳戶中新增一個Script
    ![image](https://github.com/user-attachments/assets/613b1538-a6bc-492e-a2ed-0ce74ec3f10d)    
3. 選擇你剛下載的script 檔案，並按下Create Script Record
    ![image](https://github.com/user-attachments/assets/bfdb5a18-87a6-4c1c-a327-8df7a46c0683)
4. 取一個響亮的名字, 並取一個ID.
    ![image](https://github.com/user-attachments/assets/9495730a-e61f-4699-a9f7-140f10fa2fd2)
5. 到下方Parameters頁籤中新增這兩個參數，Description可以隨便取，但ID要一模一樣
    ![image](https://github.com/user-attachments/assets/d6f097cd-4a24-491a-8e29-54b3d6f01779)
    custscript_wf_webhook_url/custscript_wf_payload_template    
6. 然後到Deployments頁籤，選擇你要啟用的表單，這邊用case當範例。
    
    ![image](https://github.com/user-attachments/assets/f9ddb71e-1f78-4130-afa1-1acbad28233a)
    
7. webhook的script怖置好之後，我們要有驅動的點，這邊來到Workflow新增一個SuiteFlow
    
    ![image](https://github.com/user-attachments/assets/3af72c04-0c7a-4606-a624-81f26ed50a16)
    
8. 一樣取一個響亮的名字，這邊的重點是你要照你想要觸發的時機選則下面的Event與Trigger Type, 這邊為了做實驗，我們選了On Create/On View Or Update, 這樣打勾的意思是你只要動到這表單它都會啟動Webhook.
    
    ![image](https://github.com/user-attachments/assets/201c6c14-ab68-4305-82a8-a80912738559)
    
9. 點選State 1，並按下右角的New Action
    
    ![image](https://github.com/user-attachments/assets/16a4ea86-32f7-4d2b-b161-1fb73df222b2)
    
10. 你可以找到我們剛裝好的萬用webhook script,  若是找不到，請去檢查第6 步的Deployments
    
    ![image](https://github.com/user-attachments/assets/f9afc58f-cce0-43ec-bb7e-3d1f40842993)
    

11. 往下拉，找到Parameters , 輸入你的webhook網址，這邊我是貼我n8n的webhook網址與Playroad Template. 注意:為了n8n後面可以接參數，我這邊設計都是傳入Json格式。你要用NetSuite的Formula去撈出你要傳的資料，並組成Json的Key:Value. 參考一下我這欄位。這段很容易少打引號或是雙引號，建議讓AI幫你弄。
    
    ![image](https://github.com/user-attachments/assets/099aac9d-d646-4315-a3c9-27e1c934c886)
    
    ```json
    '{ "case_number": "' || {casenumber} || '", "customer_name": "' || {company} || '", "customer_id": "' || {company.internalid} || '", "customer_line_field": "' || NVL({company.custentity1}, '') || '", "contact_phone": "' || {phone} || '", "contact_email": "' || {email} || '", "quick_note": "' || {quicknote} || '" }'
    
    ```
    
12. 在客戶主檔這邊新增一個**Custom Entity Field, 名稱是**Line User ID，Field ID為custentity1這是為了方才做得formula所準備的，你不一定要跨表單撈欄位。
    
    ![image](https://github.com/user-attachments/assets/4fa797e0-9c89-434f-9674-db1a4320d0ac)
    
    ![image](https://github.com/user-attachments/assets/f8f2a46f-5ba4-4351-ba98-a6387f9baaf6)
    
13. 開啟一個case, 然後存檔
    
    ![image](https://github.com/user-attachments/assets/2af0aed1-7561-4f42-80f6-c978459f8e1c)
    
14. 如果成功，你的n8n會收到這樣的畫面;
    
    ![image](https://github.com/user-attachments/assets/327d1275-d869-430b-b905-45d4de5483f7)
    
15. 然後n8n webhook收到後傳到下一個Http Request 節點，打API給Line
    
    ![image](https://github.com/user-attachments/assets/20980dd3-b1cf-4f8a-8616-c1a55fd11904)
    
16. Line畫面收到NetSuite推撥訊息
    
    ![image](https://github.com/user-attachments/assets/b00dd5ea-46d3-4a25-8df4-fe451d5e9682)
    

---

### n8n部份

- 做Line訊息轉傳，你只需要兩個節點，一個是Webhook - 負責收NetSuite打過來的資料，另一個是Http Request負責組成line訊息並發到Line API中。

![image](https://github.com/user-attachments/assets/3ec6daea-468d-443a-8601-1619136a9f97)

- Webhook節點都用預設值即可，要選POST方法，將n8n給你的網址貼到步驟11, 即對應到NetSuite Action Script的變數custscript_wf_webhook_url中

![image](https://github.com/user-attachments/assets/6cd29555-99a9-4f44-8c8c-ee27c89d6850)

### Line部份

你會需要Line的官方Developers Console(https://developers.line.biz/en/)找到你的line頻道，在Managing API下方有Channel access token複製下來。然後照這樣打到Http Request 節點中的Header Auth中，Bearer後面要有一個空白。

![image](https://github.com/user-attachments/assets/4ffda90f-f884-4717-9f75-1bd4759a5875)

![image](https://github.com/user-attachments/assets/c732b706-1062-459e-9ceb-e6756c467661)

