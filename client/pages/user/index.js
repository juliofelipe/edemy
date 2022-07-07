import { useEffect, useState, useContext } from "react";
import { Context } from "../../context";
import { axios } from "axios";

const UserIndex = () => {

    const [hidden, setHidden] = useState(true);
    const {state: {user}} = useContext(Context);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await axios.get('/api/current-user');
                console.log(data);
                setHidden(false);
            } catch (err) {
                console.error(err);
                setHidden(true);
            }
        }
        fetchUser();
    },[]);


    return (
        <>
            {!hidden && (
                <h1 className="jumbotron p-5 text-center bg-primary square">
                    <pre>{JSON.stringify(user)}</pre>
                </h1>
            )}
        </>
    )
};

export default UserIndex;