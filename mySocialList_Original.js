"use strict";

const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const users = [];
const Users_Per_Page = 20

let searchResults = []
let currentPage = 1

const dataPanel = document.querySelector("#data-panel");
const paginator = document.querySelector(".pagination")
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")

function renderUserCards(data) {

  // data為所有用戶資料的物件組合成的陣列
  let rawHTML = "";

  data.forEach(function (item) {
    rawHTML += `
    <div class="card m-4 shadow p-3 mb-5 bg-white rounded" style="width: 10rem;">
      <img src="${item.avatar}" class="card-img-top rounded" data-id="${item.id}" 
      data-toggle="modal" data-target="#userInfoModal" data-id="${item.id}" alt="user avatar">
      <div class="card-body">
        <p class="card-text"><em data-id="${item.id}">${item.name} ${item.surname}</em></p>
        <button type="button" class="btn btn-outline-info" id="addFriend" data-id="${item.id}">Add</button>
      </div>
    </div>`;
  });

  dataPanel.innerHTML = rawHTML;
}

function renderPaginator(amount) {

  const pageQuantity = Math.ceil(amount / Users_Per_Page)

  let rawPaginator = ""

  for (let page = 1; page <= pageQuantity; page++) {
    rawPaginator += `
     <li class="page-item ${page === 1 ? "active" : ""}"><a class="page-link text-warning" href="#" data-page="${page}">${page}</a></li>
  `
  }
  paginator.innerHTML = rawPaginator
}

function getUsersByPage(page) {

  // 要嘛把searchResults當成搜尋結果的長度，要嘛把users當成搜尋結果的長度
  const data = searchResults.length ? searchResults : users
  const startIndex = (page - 1) * Users_Per_Page

  return data.slice(startIndex, startIndex + Users_Per_Page)
}

//建立新的函式來處理用id抓到的資料
function showUserModal(id) {
  const modalTitle = document.querySelector("#userWholeName");
  const modalAvatar = document.querySelector("#userModalAvatar");
  const modalUserInfos = document.querySelector(".modal-user-infos");

  //將modal內容清空，以免出現資料殘影ML = "";
  modalTitle.innerText = ""
  modalAvatar.src = ""
  modalUserInfos.innerHTML = "";

  axios
    .get(INDEX_URL + `${id}`)
    .then(function (response) {
      const personalData = response.data;

      modalTitle.innerText = personalData.name + " " + personalData.surname;
      modalAvatar.src = personalData.avatar;
      modalUserInfos.innerHTML = `
      <p> Email: <b>${personalData.email}</b> </p>
      <p> Gender: <b>${personalData.gender}</b> </p>
      <p> Age: <b>${personalData.age}</b> </p>
      <p> Region: <b>${personalData.region}</b> </p>
      <p> Birthday: <b>${personalData.birthday}</b> </p>`;
    })

    .catch(function (error) {
      console.log(error);
    });
}

function addToMyFavorite(id) {

  const list = JSON.parse(localStorage.getItem("favoriteFriends")) || []
  const user = users.find((user) => user.id === id)

  if (list.some((user) => user.id === id)) {
    return alert("此用戶已在收藏清單中!")
  }

  list.push(user)
  localStorage.setItem("favoriteFriends", JSON.stringify(list))
}

dataPanel.addEventListener("click", function modalSwitch(event) {

  //把modal開關裝在用戶大頭貼上
  if (event.target.tagName === "IMG") {
    showUserModal(Number(event.target.dataset.id));

  } else if (event.target.matches('#addFriend')) {
    addToMyFavorite(Number(event.target.dataset.id))
  }
});

paginator.addEventListener("click", function onPaginatorClick(event) {

  if (event.target.tagName !== "A")
    return

  const page = Number(event.target.dataset.page)
  currentPage = page

  if (event.target.tagName === "A") {

    //先選取所有有page-item這個class name的頁碼標籤，並去掉上面的active特性
    $(".page-item").removeClass("active")

    //將點擊到的頁碼加上active特性(抓的是<a> tag 的parent element)
    event.target.parentElement.classList.add("active")
  }

  renderUserCards(getUsersByPage(page))
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {

  event.preventDefault()
  //做輸入的關鍵字的處理
  const keyword = searchInput.value.trim().toLowerCase()
  searchResults = users.filter((user) => user.name.toLowerCase().includes(keyword))

  if (searchResults.length === 0) {
    return alert(`您輸入的人名: ${keyword} 沒有符合的結果`)
  }

  currentPage = 1

  //重做分頁器
  renderPaginator(searchResults.length)
  renderUserCards(getUsersByPage(1))
})

axios
  .get(INDEX_URL)
  .then(function (response) {
    //   用迭代器把請求回傳回來的資料一一push進空容器中
    for (const user of response.data.results) {
      users.push(user);
      renderUserCards(users);
    }
    renderPaginator(users.length)
    renderUserCards(getUsersByPage(1))
  })

  .catch(function (error) {
    console.log(error);
  });
