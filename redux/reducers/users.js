import {
  USERS_DATA_STATE_CHANGE,
  USERS_POSTS_STATE_CHANGE,
  USERS_LIKES_STATE_CHANGE,
  USERS_LIKES1_STATE_CHANGE,
  CLEAR_DATA,
  USERS_POSTS_LIKES_COUNT_STATE_CHANGE,
  USERS_POSTS_AGREEMENT_COUNT_STATE_CHANGE
} from "../constants";

// @ts-check
const initialState = {
  users: [],
  feed: [],
  usersFollowingLoaded: 0,
  // ← add this slice:
  usersFollowingPosts: {
    byUid: {}           // each UID will map to { posts: [], lastVisible: … }
  }
};

export const users = (state = initialState, action) => {
  switch (action.type) {
    case USERS_DATA_STATE_CHANGE:
      return {
        ...state,
        users: [...state.users, action.user],
      };
    case USERS_POSTS_STATE_CHANGE: {
      const { uid, posts, lastVisible } = action;
      const existing = state.usersFollowingPosts.byUid[uid] || {
        posts: [],
        lastVisible: null
      };
      // first page? replace, otherwise append
      const isInitial = !existing.lastVisible;
      const newList   = isInitial
        ? posts
        : [...existing.posts, ...posts];

      return {
        ...state,
        usersFollowingLoaded: state.usersFollowingLoaded + (isInitial ? 1 : 0),
        feed: isInitial
          ? [...state.feed, ...posts]  // optional: keep old feed behavior
          : state.feed,
        usersFollowingPosts: {
          byUid: {
            ...state.usersFollowingPosts.byUid,
            [uid]: { posts: newList, lastVisible }
          }
        }
      };
    }
    case USERS_LIKES_STATE_CHANGE:
      return {
        ...state,
        feed: state.feed.map((post) =>
          post.id == action.postId
            ? { ...post, currentUserLike: action.currentUserLike }
            : post
        ),
      };
    case USERS_LIKES1_STATE_CHANGE:
      return {
        ...state,
        feed: state.feed.map((post) =>
          post.id == action.postId
            ? { ...post, currentUserLike1: action.currentUserLike1 }
            : post
        ),
      };
    case USERS_POSTS_LIKES_COUNT_STATE_CHANGE:
      return {
        ...state,
        feed: state.feed.map((post) =>
          post.id == action.postId
            ? { ...post, likesCount: action.likesCount }
            : post
        ),
      };
    case USERS_POSTS_AGREEMENT_COUNT_STATE_CHANGE:
      return {
        ...state,
        feed: state.feed.map((post) =>
          post.id == action.postId
            ? { ...post, agreementCount: action.agreementCount }
            : post
        ),
      };
    case CLEAR_DATA:
      return initialState;
    default:
      return state;
  }
};
