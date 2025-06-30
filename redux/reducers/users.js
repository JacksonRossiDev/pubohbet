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
};

export const users = (state = initialState, action) => {
  switch (action.type) {
    case USERS_DATA_STATE_CHANGE:
      return {
        ...state,
        users: [...state.users, action.user],
      };
    case USERS_POSTS_STATE_CHANGE:
      return {
        ...state,
        usersFollowingLoaded: state.usersFollowingLoaded + 1,
        feed: [...state.feed, ...action.posts],
      };
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
