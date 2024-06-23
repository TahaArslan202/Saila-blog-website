// ------------------- BLOG COMMENT CONTENT VALİDATİON ---------------------------------------------------------------------------------------------
const form = document.querySelector('form')
const contentError = document.querySelector('#content')

form.addEventListener("submit", async (e) => {
   e.preventDefault();

   contentError.textContent = "";
   contentError.style.display = "none";

   const commentContent = form.commentContent.value;

   const formContainer = document.querySelector('#commentForm');
   const blogId = formContainer.dataset.blogId;

   try {
      const res = await fetch(`/blogs/${blogId}/comment`, {
         method: "POST",
         body: JSON.stringify({ commentContent }),
         headers: { "Content-Type": "application/json" }
      });

      const data = await res.json();

      if (data) {

         if (data.content) {
            contentError.textContent = data.content
            contentError.style.display = "block"
         }

      } 

      if(data.user){
        location.assign(`/blogs/${blogId}`);
      }

   } 
   catch (err) {
    try {
        location.assign("/login");
    } catch (error) {
        console.log("ERR::", err)
    }
      console.log("ERR::", err)
   }
});

// ------------------- BLOG COMMENTS TOOGLE SHOW ---------------------------------------------------------------------------------------------
function toggleReplies(commentId) {
const repliesDiv = document.getElementById('replies-' + commentId);

if (repliesDiv) {
if (repliesDiv.style.display === 'none' || repliesDiv.style.display === '') {
  repliesDiv.style.display = 'block';
} else {
  repliesDiv.style.display = 'none';
}
}
}

function showReplyForm(button) {
    const replyForm = button.parentElement.nextElementSibling;
    replyForm.style.display = 'flex';
}

function hideReplyForm(button) {
    const replyForm = button.closest('.reply-form');
    replyForm.style.display = 'none';
}

// ------------------- BLOG COMMENTS DATE SHOW ---------------------------------------------------------------------------------------------
function timeAgo(date) {
        const now = new Date();
        const createdDate = new Date(date);
        const diff = now - createdDate; // milliseconds

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return days + " gün önce";
        } else if (hours > 0) {
            return hours + " saat önce";
        } else if (minutes > 0) {
            return minutes + " dakika önce";
        } else {
            return seconds + " saniye önce";
        }
    }

document.addEventListener("DOMContentLoaded", () => {
        const dateElements = document.querySelectorAll(".date");
        dateElements.forEach(element => {
            const createdDate = element.getAttribute("data-date");
            element.textContent = timeAgo(createdDate);
        });
});

// ------------------- BLOG READ COUNT SHOW ---------------------------------------------------------------------------------------------
function blogOkunduMu() {
    setTimeout(function() {
        
        const formContainer = document.querySelector('#commentForm');
        const blogId = formContainer.dataset.blogId;

        fetch(`/blogs/${blogId}/read?_method=PUT`,{
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.succeeded) {
                updateBlogRead(data.blog);
            }
        });
    }, 10000);
}

function updateBlogRead(blog) {
    const likeCount = document.querySelector(`#read-count-${blog._id}`);
    likeCount.textContent = blog.blogread.length;
}

blogOkunduMu();

// ------------------- BLOG AND COMMENT ; LİKE COUNT , DİSLİKE COUNT AND ICON SHOW ---------------------------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#like-button').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const blogId = button.getAttribute('data-blog-id');
            const commentId = button.getAttribute('data-comment-id');
            const commentcommentId = button.getAttribute('data-commentcomment-id');
            const blogName = button.getAttribute('data-blog-name');
   
            if(blogName){
                fetch(`/blogs/${blogId}/like?_method=PUT`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.succeeded) {
                        updateLikeDislikeCount(data.blog);
                    }
                });
            }
            else{
                if(commentcommentId){
                    fetch(`/blogs/${blogId}/comment/${commentId}/${commentcommentId}/like?_method=PUT`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.succeeded) {
                            updateLikeDislikeCount(data.comment);
                        }
                    });
                }
                else{
                    fetch(`/blogs/${blogId}/comment/${commentId}/like?_method=PUT`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.succeeded) {
                            updateLikeDislikeCount(data.comment);
                        }
                    });
                }
            }

        });
    });

    document.querySelectorAll('#dislike-button').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const blogId = button.getAttribute('data-blog-id');
            const commentId = button.getAttribute('data-comment-id');
            const commentcommentId = button.getAttribute('data-commentcomment-id');
            const blogName = button.getAttribute('data-blog-name');
   
            if(blogName){
                fetch(`/blogs/${blogId}/dislike?_method=PUT`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.succeeded) {
                        updateLikeDislikeCount(data.blog);
                    }
                });
            }
            else{
                if(commentcommentId){
                    fetch(`/blogs/${blogId}/comment/${commentId}/${commentcommentId}/dislike?_method=PUT`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.succeeded) {
                            updateLikeDislikeCount(data.comment);
                        }
                    });
                }
                else{
                    fetch(`/blogs/${blogId}/comment/${commentId}/dislike?_method=PUT`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.succeeded) {
                            updateLikeDislikeCount(data.comment);
                        }
                    });
                }
            }

        });
    });

    function updateLikeDislikeCount(data) {
        const commentContainer = document.querySelector('#USERID');
        const userId = commentContainer.dataset.userId;

        const likeCount = document.querySelector(`#like-count-${data._id}`);
        const dislikeCount = document.querySelector(`#dislike-count-${data._id}`);
        
        const likeButton = document.querySelector(`#like-button[data-comment-id="${data._id}"] i`);
        const dislikeButton = document.querySelector(`#dislike-button[data-comment-id="${data._id}"] i`);

        const commentlikeButton = document.querySelector(`#like-button[data-commentcomment-id="${data._id}"] i`);
        const commentdislikeButton = document.querySelector(`#dislike-button[data-commentcomment-id="${data._id}"] i`);

        const bloglikeButton = document.querySelector(`#like-button[data-blog-name="${data.name}"] i`);
        const blogdislikeButton = document.querySelector(`#dislike-button[data-blog-name="${data.name}"] i`);

        likeCount.textContent = data.likes.length;
        dislikeCount.textContent = data.dislikes.length;

        if(likeButton && dislikeButton){
            if (data.likes.includes(userId)) {
                likeButton.classList.remove('fa-thumbs-o-up');
                likeButton.classList.add('fa-thumbs-up');
            } else {
                likeButton.classList.remove('fa-thumbs-up');
                likeButton.classList.add('fa-thumbs-o-up');
            }
    
            if (data.dislikes.includes(userId)) {
                dislikeButton.classList.remove('fa-thumbs-o-down');
                dislikeButton.classList.add('fa-thumbs-down');
            } else {
                dislikeButton.classList.remove('fa-thumbs-down');
                dislikeButton.classList.add('fa-thumbs-o-down');
            }
        }
        if(commentlikeButton && commentdislikeButton){
            if (data.likes.includes(userId)) {
                commentlikeButton.classList.remove('fa-thumbs-o-up');
                commentlikeButton.classList.add('fa-thumbs-up');
            } else {
                commentlikeButton.classList.remove('fa-thumbs-up');
                commentlikeButton.classList.add('fa-thumbs-o-up');
            }
    
            if (data.dislikes.includes(userId)) {
                commentdislikeButton.classList.remove('fa-thumbs-o-down');
                commentdislikeButton.classList.add('fa-thumbs-down');
            } else {
                commentdislikeButton.classList.remove('fa-thumbs-down');
                commentdislikeButton.classList.add('fa-thumbs-o-down');
            }
        }
        if(bloglikeButton && blogdislikeButton){
            if (data.likes.includes(userId)) {
                bloglikeButton.classList.remove('fa-thumbs-o-up');
                bloglikeButton.classList.add('fa-thumbs-up');
            } else {
                bloglikeButton.classList.remove('fa-thumbs-up');
                bloglikeButton.classList.add('fa-thumbs-o-up');
            }
    
            if (data.dislikes.includes(userId)) {
                blogdislikeButton.classList.remove('fa-thumbs-o-down');
                blogdislikeButton.classList.add('fa-thumbs-down');
            } else {
                blogdislikeButton.classList.remove('fa-thumbs-down');
                blogdislikeButton.classList.add('fa-thumbs-o-down');
            }
        }
    }

});




