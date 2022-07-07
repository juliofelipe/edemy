import { useState, useEffect, useContext } from "react";
import { Menu } from "antd";
import Link from "next/link";
import  {
    AppstoreOutlined,
    LoginOutlined,
    UserAddOutlined,
    LogoutOutlined,
    CoffeeOutlined,
} from "@ant-design/icons";
import {Context} from "../context";
import axios from "axios";
import {useRouter} from "next/router";
import {toast} from "react-toastify";

const { Item, SubMenu, ItemGroup } = Menu;

const TopNav = () => {
    const [current, setCurrent] = useState("");

    const { state, dispatch } = useContext(Context);
    const { user } = state;

    const router = useRouter();

    const logout = async () => {
        dispatch({ type: "LOGOUT" })
        window.localStorage.removeItem("user");
        const { data } = await axios.get("/api/logout");
        toast(data.message);
        router.push("/login");
    }

    useEffect(() => {
        process.browser && setCurrent(window.location.pathname)
    },[process.browser && window.location.pathname])

    return (
        <Menu mode="horizontal" selectedKeys={[current]}>
            <Item 
                key="/" 
                onClick={(e) => setCurrent(e.key)}
                icon={<AppstoreOutlined/>}
            >
                <Link href="/">
                    <a>App</a>
                </Link>
            </Item>

            {user === null && (
                <>
                    <Item key="/login" icon={<LoginOutlined/>}
                        onClick={(e) => setCurrent(e.key)}>
                        <Link href="/login">
                            <a>Login</a>
                        </Link>
                    </Item>

                    <Item key="/register" icon={<UserAddOutlined/>}
                        onClick={(e) => setCurrent(e.key)}>
                        <Link href="/register">
                            <a>Register</a>
                        </Link>
                    </Item>
                </>
            )}

            {user !== null && (
                <SubMenu 
                icon={<CoffeeOutlined />} 
                title={user && user.name}
                className="float-right"
                >
                  <ItemGroup>
                        <Item key="/user">
                            <Link href="/user"> 
                                <a>Dashboard</a>
                            </Link>
                        </Item>
                        <Item 
                            onClick={logout} 
                            icon={<LogoutOutlined />} 
                            >
                            Logout
                        </Item>
                    </ItemGroup>
                </SubMenu>
            )}
        </Menu>

    )
};

export default TopNav;