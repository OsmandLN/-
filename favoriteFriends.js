"use strict";

const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const users = JSON.parse(localStorage.getItem("favoriteFriends")) || [];
const Users_Per_Page = 20
let searchResults = []

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
        <button type="button" class="btn btn-outline-danger" id="removeFriend" data-id="${item.id}">Remove</button>
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
     <li class="page-item"><a class="page-link text-warning" href="#" data-page="${page}">${page}</a></li>
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

function removeFromFavorite(id) {
  if (!users || !users.length) return
  //透過id找到要刪除的用戶的index
  const userIndex = users.findIndex((user) => user.id === id)

  if (userIndex === -1) return
  //刪除該用戶
  users.splice(userIndex, 1)
  //存回local storage
  localStorage.setItem("favoriteFriends", JSON.stringify(users))

  renderUserCards(users)
}

dataPanel.addEventListener("click", function modalSwitch(event) {
  //把modal開關裝在用戶大頭貼上
  if (event.target.tagName === "IMG") {
    showUserModal(Number(event.target.dataset.id));
  } else if (event.target.matches('#removeFriend')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
});


renderUserCards(users)