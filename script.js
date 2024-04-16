const storageKey = "STORAGE_KEY";
const titleLabel = document.getElementById("title-label");
const titleInput = document.getElementById("title");
const authorLabel = document.getElementById("author-label");
const authorInput = document.getElementById("author");
const yearLabel = document.getElementById("year-label");
const yearInput = document.getElementById("year");
const isCompleted = document.getElementById("is-completed");
const submitAction = document.getElementById("book-form");

floatingInputLabel(titleInput, titleLabel, "Judul");
floatingInputLabel(authorInput, authorLabel, "Penulis");
floatingInputLabel(yearInput, yearLabel, "Tahun");

submitAction.addEventListener("submit", function (event) {
  event.preventDefault();
  const newBookData = {
    id: generateId(),
    title: titleInput.value,
    author: authorInput.value,
    year: yearInput.value,
    isCompleted: isCompleted.checked,
  };
  putBookList(newBookData);
  submitAction.reset();
  unfocusAllInput();
  renderBookList();
});

window.addEventListener("load", function () {
  if (checkForStorage) {
    renderBookList();
  } else {
    alert("Browser yang Anda gunakan tidak mendukung Web Storage");
  }
});

// Functions
function floatingInputLabel(inputElement, labelElement, placeholder) {
  inputElement.addEventListener("focus", function () {
    labelElement.removeAttribute("hidden");
    this.removeAttribute("placeholder");
  });

  inputElement.addEventListener("blur", function () {
    if (this.value.length === 0) {
      labelElement.setAttribute("hidden", "true");
      this.setAttribute("placeholder", placeholder);
      this.classList.remove("input-has-value");
    } else {
      this.classList.add("input-has-value");
    }
  });
}

function unfocusAllInput() {
  titleInput.focus();
  authorInput.focus();
  yearInput.focus();
  titleInput.blur();
  authorInput.blur();
  yearInput.blur();
}

function checkForStorage() {
  return typeof Storage !== "undefined";
}

function putBookList(data) {
  if (checkForStorage()) {
    let bookData = [];
    if (localStorage.getItem(storageKey) !== null) {
      bookData = JSON.parse(localStorage.getItem(storageKey));
    }
    bookData.unshift(data);
    if (bookData.length > 5) {
      bookData.pop();
    }
    localStorage.setItem(storageKey, JSON.stringify(bookData));
  }
}

function overideBookList(bookData) {
  if (checkForStorage()) {
    localStorage.setItem(storageKey, JSON.stringify(bookData));
  }
}

function getBookList() {
  if (checkForStorage()) {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } else {
    return [];
  }
}

function renderBookList() {
  const bookData = getBookList();
  const unfinishedBookList = document.getElementById("unfinished-book-content");
  const finishedBookList = document.getElementById("finished-book-content");
  const countFinishedBook = countFinishedBookList(bookData);
  const countUnfinishedBook = countUnfinishedBookList(bookData);

  finishedBookList.innerHTML = "";
  unfinishedBookList.innerHTML = "";

  if (countUnfinishedBook === 0) {
    generateWhenNoBook(
      unfinishedBookList,
      "Tidak ada buku yang belum selesai dibaca"
    );
  }

  if (countFinishedBook === 0) {
    generateWhenNoBook(finishedBookList, "Tidak ada buku yang selesai dibaca");
  }

  for (let book of bookData) {
    if (book.isCompleted) {
      finishedBookList.appendChild(generateBook(book));
      finishedBookList.classList.add("not-empty");
    } else {
      unfinishedBookList.appendChild(generateBook(book));
      unfinishedBookList.classList.add("not-empty");
    }
  }
}

function countFinishedBookList(bookData) {
  let count = 0;
  for (const book of bookData) {
    if (book.isCompleted) {
      count += 1;
    }
  }
  return count;
}

function countUnfinishedBookList(bookData) {
  let count = 0;
  for (const book of bookData) {
    if (!book.isCompleted) {
      count += 1;
    }
  }
  return count;
}

function generateWhenNoBook(bookList, text) {
  const p = document.createElement("p");
  p.innerText = text;
  p.classList.add("empty-books");

  bookList.appendChild(p);
  bookList.classList.remove("not-empty");

  return bookList;
}

function generateBook(bookData) {
  const book = createElementWithClass("article", "book");
  const bookIcon = createElementWithClass("i", "ti", "ti-book-2", "book-icon");

  book.appendChild(bookIcon);

  const wrapper = document.createElement("div");
  const title = document.createElement("h3");
  const author = createElementWithClass("p", "book-author");

  title.innerText = `${bookData.title} (${bookData.year})`;
  author.innerText = bookData.author;

  wrapper.appendChild(title);
  wrapper.appendChild(author);

  const buttonWrapper = document.createElement("div");

  const finishedButton = createElementWithClass(
    "button",
    "finished-book-button",
    "book-button"
  );
  const deleteButton = createElementWithClass(
    "button",
    "delete-button",
    "book-button"
  );
  const trashIcon = createElementWithClass("i", "ti", "ti-trash");

  deleteButton.addEventListener("click", function () {
    deleteButtonHandler(bookData.id);
  });

  if (bookData.isCompleted) {
    finishedButton.innerText = "Belum Selesai Dibaca";
  } else {
    finishedButton.innerText = "Selesai Dibaca";
  }

  deleteButton.appendChild(trashIcon);

  buttonWrapper.appendChild(finishedButton);
  buttonWrapper.appendChild(deleteButton);

  wrapper.appendChild(buttonWrapper);

  book.appendChild(wrapper);

  return book;
}

function createElementWithClass(element, ...classLists) {
  const createdElement = document.createElement(element);

  createdElement.classList.add(...classLists);

  return createdElement;
}

function deleteButtonHandler(bookID) {
  if (confirm("Anda yakin ingin menghapus buku?")) {
    const bookData = getBookList();
    const bookTarget = findBookIndex(bookID);

    if (bookTarget === -1) {
      return;
    }

    bookData.splice(bookTarget, 1);
    overideBookList(bookData);

    renderBookList();
  }
}

function generateId() {
  return +new Date();
}

function findBookIndex(bookID) {
  const bookData = getBookList();

  for (const index in bookData) {
    if (bookData[index].id === bookID) {
      return index;
    }
  }

  return -1;
}
