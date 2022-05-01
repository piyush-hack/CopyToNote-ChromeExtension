const getStorageData = key =>
    new Promise((resolve, reject) =>
        chrome.storage.local.get(key, result =>
            chrome.runtime.lastError
                ? reject(loadD("none", { msg: JSON.stringify(chrome.runtime.lastError.message) }))
                : resolve(result)
        )
    )

const setStorageData = data =>
    new Promise((resolve, reject) =>
        chrome.storage.local.set(data, () =>
            chrome.runtime.lastError
                ? reject(loadD("none", { msg: JSON.stringify(chrome.runtime.lastError.message) }))
                : resolve()
        )
    )

const delStorageData = data =>
    new Promise((resolve, reject) =>
        chrome.storage.local.remove(data, () =>
            chrome.runtime.lastError
                ? reject(loadD("none", { msg: JSON.stringify(chrome.runtime.lastError.message) }))
                : resolve()
        )
    )


$("#noteform").submit(async function (e) {
    $(".ldiv").css("display", "block")

    e.preventDefault();
    let lt = $("#loginToken").val();
    await setStorageData({ 'ltkey': lt });
    await init();
    $("#pi-slide-1-trigger").prop('checked', true);
    $(".ldiv").css("display", "none")
});

$("#csem").on("click", async function () {
    $(".ldiv").css("display", "block")
    if ($(this).is(':checked')) {
        await setStorageData({ 'cse': true });
    } else {
        await setStorageData({ 'cse': false });
    }
    setTimeout(() => {
        init();
    }, 1000);
    setTimeout(async () => {
        $(".ldiv").css("display", "none")
    }, 2000);
});

$("#swsm").on("click", async function () {
    $(".ldiv").css("display", "block");
    if ($(this).is(':checked')) {
        await setStorageData({ 'sws': true });
    } else {
        await setStorageData({ 'sws': false });
    }
    setTimeout(async () => {
        $(".ldiv").css("display", "none")
    }, 1000);
});
$("#resa").on("click", async function () {
    $(".ldiv").css("display", "block");
    if ($(this).is(':checked')) {
        await chrome.storage.local.clear();
        await init();
    }
    setTimeout(async () => {
        $(".ldiv").css("display", "none")
    }, 1000);
});
$("#jwbr").on("click", async function () {
    $(".ldiv").css("display", "block");
    let count = $("#cbrosp").val();
    if(!count){
        alert("Enter Number OF Times You Want Spaces OR Break");
        $(".ldiv").css("display", "none")
        return;
    }

    if ($(this).is(':checked')) {
        await setStorageData({ 'jwbr': {state : "<br>", count : count} });
    }else{
        await setStorageData({ 'jwbr': {state : "&nbsp;", count : count} });
    }
    setTimeout(async () => {
        $(".ldiv").css("display", "none")
    }, 1000);
});


$("#newLnBtn").on("click", async function () {
    let ast = await getStorageData();
    let loop = true;
    while (loop) {
        let newNote = Math.floor(100000 + Math.random() * 900000);
        if (!ast["n-" + newNote]) {
            ast["n-" + newNote] = { id: newNote, desc: "" }
            await setStorageData(ast);
            await addLn(ast["n-" + newNote]);
            console.log(ast)
            await initLnt();
            loop = false;
        }

    }


    // if (ast && ast.lns) {
    //     keyId = ast.lns.length + 1;
    //     await ast.lns.push({ id: keyId, desc: "" });
    //     await addLn({ id: keyId, desc: "" });
    // } else {
    //     ast.lns = [{ id: 1, desc: "" }];
    //     addLn({ id: 1, desc: "" });
    // }

    // await setStorageData(ast);
    // await initLnt();
})

async function addLn(e, lntkey = -1) {
    if (e) {

        await $(".localNotes").append(`<div class="card">
    <div class="card-body position-relative">
      <h5 class="card-title float-start">${"Note " + e.id}</h5>
      <button type="button" class="btn btn-sm btn-outline-danger float-end tlnt" data-mdb-ripple-color="dark" id="${"t-" + e.id}"><i class="fa-solid fa-delete-left"></i></button>
      <br><br>
      <div class="card-text p-3 lndesc" contenteditable="true" id="${"d-" + e.id}">${e.desc}</div>
      <button type="button" class="btn btn-sm position-absolute d-none sln" data-mdb-ripple-color="dark" id="${"s-" + e.id}" style="top: 22px;left: 147px;"><i class="fas fa-save"></i></button>
      <button type="button" class="btn btn-sm btn-outline-dark float-end expln mt-4" data-mdb-ripple-color="dark" id="${"e-" + e.id}" tableindex="1" ><i class="fas fa-expand"></i></i></button>
      <a href="#" class="card-link">
      <div class="form-check">
      <br>
      <input class="form-check-input setlnt" type="checkbox" id="${e.id}" ${lntkey == e.id ? "checked" : ""} value="" />
      <label class="form-check-label">Checkbox For Current Note</label>
      </div></a>
    </div>
  </div><br>`);
    }

}


//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjIyMDg1MzVjMzczZGRjZWE3MTJlYWMyIn0sImlhdCI6MTY1MTE0MDY4NH0.Io6U3ZyoT2E6HUvGFuBuOjJ5DXmDGAjvc9DEwjFbF_g


//626a689edb25c2b54839b178
//https://noteyard-backend.herokuapp.com/api/notes/addNoteDesc/626a689edb25c2b54839b178
//auth-token
//PUT

async function initLnt() {
    $('.setlnt').bind('change', async function () {
        $(".ldiv").css("display", "block")
        if ($(this).is(':checked')) {
            let ast = await getStorageData();
            ast.lntkey = $(this).attr("id");
            await setStorageData(ast);
            // console.log(ast)
        }
        else {
            alert("Unchecked");
        }
        $(".ldiv").css("display", "none")
    });
    $(".sln").on("click", async function () {
        $(".ldiv").css("display", "block")

        let currLn = parseInt($(this).attr("id").slice(2));

        let ast = await getStorageData();
        // let idx = ast[currLn];
        ast["n-" + currLn].desc = $("#d-" + currLn).html();
        // console.log(ast, currLn, idx, ast.lns[idx], $("#d-" + currLn).html())

        await setStorageData(ast);
        $(".ldiv").css("display", "none")

    })

    $('.tlnt').on('click', async function () {
        $(".ldiv").css("display", "block")
        let ast = await getStorageData();
        let currLn = parseInt($(this).attr("id").slice(2));
        // let idx = ast.lns.findIndex(x => x && x.id == currLn);
        // ast.lns[idx] = null;
        await delStorageData(["n-" + currLn]);
        setTimeout(async () => {
            console.log("trash", ast)
            $(this).parent().parent().remove();
            $(".ldiv").css("display", "none");
            init();
        }, 1000);

    });

    $('.expln').on("click", function () {
        try {
            $(this).parent().parent().toggleClass("expandLn");
        } catch (error) {

        }
    });
}


async function init() {
    $(".ldiv").css("display", "block")
    let at = await getStorageData();
    if (at && at.sws) {
        await $("#swsm").prop('checked', true);
    } else {
        await $("#swsm").prop('checked', false);
    }

    if(at && at.jwbr){
        if(at.jwbr.state == "<br>"){
            await $("#jwbr").prop('checked', true);
            await $("#cbrosp").val(at.jwbr.count);
        }else{
            await $("#jwbr").prop('checked', false);
            await $("#cbrosp").val(at.jwbr.count);
        }
    }
    console.log(at);

    $(".localNotes").html("<br><br>");
    if ((at.cse && at.cse == false) || !at.cse) {
        await $("#newLnBtn").css('display', "block");
        await $("#hln").html("Local Storage Notes.");
        await $("#pi-slide-3-trigger").prop('checked', true);
        if (at && at.ltkey) {
            $(".allNotes").html("<br><br><h2>Your Are Currently In Local Note Mode!</h2>");
        }
        if (at) {
            let i = 0;
            for (const k in at) {
                const e = at[k];
                if (k.slice(0, 2) == "n-") {
                    await addLn(e, at.lntkey);
                }
                if (Object.keys(at).length - 1 == i) {
                    await initLnt();
                }
                i++;
            }
            $(".ldiv").css("display", "none")
        } else {
            $(".ldiv").css("display", "none")
        }
    } else {
        await $("#csem").prop('checked', true);
        await $("#newLnBtn").css('display', "none");
        await $("#hln").html("Currently In Cloud Mode.");
        if (at && at.ltkey) {
            let res = await callAPI(
                "GET",
                "https://noteyard-backend.herokuapp.com/api/notes/fetchallnotes"
            );
            console.log(res);
            await showNotes(res);
        } else {
            $("#pi-slide-2-trigger").prop('checked', true);
            $(".ldiv").css("display", "none")
        }
        await $("#pi-slide-1-trigger").prop('checked', true);
    }
}
init();

async function showNotes(res) {
    $(".allNotes").html("<br><br>");
    if (res.length == 0) {
        $(".allNotes").html("<br><br><h1>No Note Available Create One!!</h1>");
    }
    let ast = await getStorageData();
    let mid = "";
    if (ast && ast.ntkey) {
        mid = ast.ntkey;
        console.log(mid)
    }
    for (let i = 0; i < res.length; i++) {
        const e = res[i];
        if (e.tag == "BLOG NOTE") {
            $(".allNotes").append(`<div class="card">
            <div class="card-body">
              <h5 class="card-title">${e.title}</h5>
              <div class="card-text">${e.description}</div>
              <a href="#" class="card-link">
              <div class="form-check">
              <br>
              <input class="form-check-input setnt" type="checkbox" value="" id="${e._id}" ${mid == e._id ? "checked" : ""} />
              <label class="form-check-label" for="${e._id}">Checkbox For Current Note</label>
              </div></a>
            </div>
          </div><br>`);
        }
        if (i == res.length - 1) {
            $('.setnt').bind('change', async function () {
                if ($(this).is(':checked')) {
                    let ast = await getStorageData();
                    ast.ntkey = $(this).attr("id");
                    await setStorageData(ast);
                    // console.log(ast)
                }
                else {
                    alert("Unchecked");
                }
            });
        }
    }
    $(".ldiv").css("display", "none")
}


async function callAPI(method = "POST", url = "", data = {}) {
    try {
        let at = await getStorageData("ltkey");
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
            // await loadD("none");
            return response.json();
        } else {
            const response = await fetch(url, {
                method: method, // *GET, POST, PUT, DELETE, etc.
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": at || null,
                },
            });
            // await loadD("none");
            return response.json();
        }
    } catch (error) {
        console.log(error);
        // setAlertScreen("REQUEST FAILED. Check console for more", "danger")
    }
}