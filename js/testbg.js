const getStorageData = (key) =>
    new Promise((resolve, reject) =>
        chrome.storage.sync.get(key, (result) =>
            chrome.runtime.lastError
                ? reject(loadD("none", { msg: JSON.stringify(chrome.runtime.lastError.message) }))
                : resolve(result)
        )
    );

const setStorageData = (data) =>
    new Promise((resolve, reject) =>
        chrome.storage.sync.set(data, () =>
            chrome.runtime.lastError
                ? reject(loadD("none", { msg: JSON.stringify(chrome.runtime.lastError.message) }))
                : resolve()
        )
    );
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "live-translate",
        title: "Copy To Note",
        contexts: ["selection"],
    });
});



function getSelectedText() {
    if (!document.getElementById("copyToNoteFrame_%^%#4234681%@#")) {
        let lframe = document.createElement("iframe");
        lframe.setAttribute("id", "copyToNoteFrame_%^%#4234681%@#");
        lframe.setAttribute("frameborder", 0);
        lframe.style.cssText = `
    position: fixed;
    right: -118px;
    top: 0px;
    z-index: 99999999999;`;
        document.body.appendChild(lframe);

        var iframeDoc = (lframe.contentWindow || lframe.documentWindow).document;

        iframeDoc.open();
        iframeDoc.write(`
    <style>
    .google-loader {
        display: block;
      }
      .google-loader span {
        display: inline-block;
        margin-top: 10px;
        height: 20px;
        width: 20px;
        border-radius: 50%;
      }
      .google-loader span:not(:first-child) {
        margin-left: 10px;
      }
      .google-loader span:nth-child(1) {
        background: #4285F4;
        animation: move 1s ease-in-out -0.25s infinite alternate;
      }
      .google-loader span:nth-child(2) {
        background: #DB4437;
        animation: move 1s ease-in-out -0.5s infinite alternate;
      }
      .google-loader span:nth-child(3) {
        background: #F4B400;
        animation: move 1s ease-in-out -0.75s infinite alternate;
      }
      .google-loader span:nth-child(4) {
        background: #0F9D58;
        animation: move 1s ease-in-out -1s infinite alternate;
      }
      @keyframes move {
        from {
          transform: translateY(-10px);
        }
        to {
          transform: translateY(5px);
        }
      }
    </style>
    <div class="google-loader">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
    </div>`);
        iframeDoc.close();
    } else {
        document.getElementById("copyToNoteFrame_%^%#4234681%@#").style.display = "block";
    }

    var range;
    if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        // console.log(range.htmlText);
        return range.htmlText;
    } else if (window.getSelection) {
        var selection = window.getSelection();
        if (selection.rangeCount > 0) {
            range = selection.getRangeAt(0);
            var clonedSelection = range.cloneContents();
            var div = document.createElement("div");
            div.appendChild(clonedSelection);
            // console.log(div.innerHTML);
            return div.innerHTML;
        } else {
            return "";
        }
    } else {
        return "";
    }
}

let tid;

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    tid = tab.id;
    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            func: getSelectedText,
        },
        async (e) => {
            // console.log(e[0].result)
            let nt = await getStorageData();
            if ((nt.cse && nt.cse == false) || !nt.cse) {
                if (!nt || !nt.lntkey) {
                    await loadD("none", { msg: "Select a Local Note To Add" });
                    return;
                }
                let idx = nt.lns.findIndex(x => x && x.id == nt.lntkey);
                console.log(nt.lntkey, idx, nt.lns[idx])
                if (idx == -1) {
                    await loadD("none", { msg: "Selected Note Doesn't Exists. You May Have Deleted It Or Cleared Chache Of Your Browser. Please Select A New Note" });
                    return;

                }
                nt.lns[idx].desc += "<br>" + e[0].result;
                await setStorageData(nt);
                await loadD("none");
            } else {

                if (!nt || !nt.ntkey) {
                    await loadD("none", { msg: "Select a Note To Add" });
                    return;
                }
                let res = await callAPI(
                    "PUT",
                    "https://noteyard-backend.herokuapp.com/api/notes/addNoteDesc/" +
                    nt.ntkey,
                    { description: e[0].result }
                );
                console.log(res);
            }
        }
    );
});

function loadD(dis, msg = {}) {
    function changeDisplay(dis, msg) {
        if (document.getElementById("copyToNoteFrame_%^%#4234681%@#")) {
            document.getElementById("copyToNoteFrame_%^%#4234681%@#").style.display =
                dis;
        } else {
            console.log("Not Found");
        }
        console.log(msg)
        if (msg.msg) {
            alert(msg.msg);
        }
    }
    chrome.scripting.executeScript(
        {
            target: { tabId: tid },
            func: changeDisplay,
            args: [dis, msg],
        },
        async () => {
            console.log("");
        }
    );
}

async function callAPI(method = "POST", url = "", data = {}) {
    try {
        let at = await getStorageData("ltkey");
        if (!at || !at.ltkey) {
            await loadD("none", { msg: "Login First!" });
        }
        at = at.ltkey;
        if (method !== "GET") {
            const response = await fetch(url, {
                method: method, // *GET, POST, PUT, DELETE, etc.
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": at || null,
                },
                body: JSON.stringify(data),
            });
            await loadD("none");
            return response.json();
        } else {
            const response = await fetch(url, {
                method: method, // *GET, POST, PUT, DELETE, etc.
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": at || null,
                },
            });
            await loadD("none");
            return response.json();
        }
    } catch (error) {
        console.log(error);
        await loadD("none", error);

        // setAlertScreen("REQUEST FAILED. Check console for more", "danger")
    }
}

