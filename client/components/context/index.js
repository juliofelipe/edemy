import { userReducer, createContext } from "react";

const initialState = {
    user: null,
};

const Context = createContext();

const rootReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN":
            return {...state, user: action.payload };
        case "LOGOUT":
            return {...state, user: null };
        default:
            return state
    }
};