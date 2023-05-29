import { Component, OnInit } from '@angular/core';
import { Post } from '../../models/Post';
import { User } from '../../models/User';
import { PostService } from '../../service/post.service';
import { UserService } from '../../service/user.service';
import { CommentService } from '../../service/comment.service';
import { NotificationService } from '../../service/notification.service';
import { ImageUploadService } from '../../service/image-upload.service';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css'],
})
export class IndexComponent implements OnInit {
  isPostsLoaded = false;
  posts: Post[];
  sortedPosts: Post[];
  filteredPosts: Post[];
  isUserDataLoaded = false;
  user: User;
  searchValue: string;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private postService: PostService,
    private userService: UserService,
    private commentService: CommentService,
    private notificationService: NotificationService,
    private imageService: ImageUploadService
  ) {}

  ngOnInit(): void {
    this.postService.getAllPosts().subscribe((data) => {
      console.log(data);
      this.searchValue = '';
      this.posts = data;
      this.getImagesToPosts(this.posts);
      this.getCommentsToPosts(this.posts);
      this.sortedPosts = [...this.posts].sort((a, b) => b.likes - a.likes);
      this.filteredPosts = this.posts;
      this.isPostsLoaded = true;
    });

    this.userService.getCurrentUser().subscribe((data) => {
      console.log(data);
      this.user = data;
      this.isUserDataLoaded = true;
    });
  }

  onKey(event) {
    this.searchValue = event.target.value;
    this.filteredPosts = this.posts.filter((post) =>
      post.title.toLowerCase().includes(this.searchValue.toLowerCase())
    );
    this.sortedPosts = [...this.filteredPosts].sort(
      (a, b) => b.likes - a.likes
    );
  }

  getImagesToPosts(posts: Post[]): void {
    posts.forEach((p) => {
      this.imageService.getImageToPost(p.id).subscribe((data) => {
        p.image = data.imageBytes;
      });
    });
  }

  getCommentsToPosts(posts: Post[]): void {
    posts.forEach((p) => {
      this.commentService.getCommentsToPost(p.id).subscribe((data) => {
        p.comments = data;
      });
    });
  }

  likePost(postId: number): void {
    const post = this.posts.find((post) => post.id === postId);
    console.log(post);

    if (!post.usersLiked.includes(this.user.username)) {
      this.postService.likePost(postId, this.user.username).subscribe(() => {
        post.usersLiked.push(this.user.username);
        this.notificationService.showSnackBar('Liked!');
        post.likes += 1;
      });
    } else {
      this.postService.likePost(postId, this.user.username).subscribe(() => {
        const index = post.usersLiked.indexOf(this.user.username, 0);
        if (index > -1) {
          post.usersLiked.splice(index, 1);
          post.likes -= 1;
        }
      });
    }
  }

  postComment(message: string, postId: number): void {
    const post = this.posts.find((post) => post.id === postId);

    console.log(post);
    this.commentService
      .addToCommentToPost(postId, message)
      .subscribe((data) => {
        console.log(data);
        post.comments.push(data);
      });
  }
  scrollToTop(): void {
    // scroll to the top of the body
    return this.document.body.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'start',
    });
  }
  formatImage(img: any): any {
    if (img == null) {
      return null;
    }
    return 'data:image/jpeg;base64,' + img;
  }
}
