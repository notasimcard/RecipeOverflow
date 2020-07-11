import { User } from '../user.model';
import * as AuthActions from './auth.action';

export interface State {
  user: User;
  authError: string;
  isLoading: boolean;
}

const initialState = {
  user: null,
  authError: null,
  isLoading: false
};

export function authReducer(state = initialState, action: AuthActions.AuthActions) {
  switch (action.type) {
    case AuthActions.LOGIN_START:
    case AuthActions.SIGNUP_START:
      return {
        ...state,
        authError: null,
        isLoading: true
      };
    case AuthActions.AUTHENTICATE_SUCCESS:
      const newUser = new User(action.payload.email, action.payload.id, action.payload.token, action.payload.expirationDate);
      return {
        ...state,
        user: newUser,
        authError: null,
        isLoading: false
      };
    case AuthActions.AUTHENTICATE_FAIL:
      return {
        ...state,
        authError: action.payload,
        isLoading: false
      };
    case AuthActions.LOGOUT:
      return {
        ...state,
        user: null
      };
    case AuthActions.CLEAR_ERROR:
      return {
        ...state,
        authError: null
      };
    default:
      return state;
  }
}
