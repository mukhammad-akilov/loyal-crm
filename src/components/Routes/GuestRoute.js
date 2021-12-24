import React, {useContext} from 'react';
import {Route, Redirect} from 'react-router-dom';
// Redux
import {useSelector} from "react-redux";

const GuestRoute = ({ children, ...rest }) => {
    const userState = useSelector(state => state.user);

    return (
        <Route
            {...rest}
            render={({ location }) =>
                !userState.isAuth ? (
                    children
                ) : (
                    <Redirect
                        to={{
                            pathname: "/",
                            state: { from: location }
                        }}
                    />
                )
            }
        />
    );
}

export default GuestRoute;