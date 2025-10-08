import { Header } from "../components/Header";

const AdminPage = () => {
    return (
        <>
            <Header />
            <div>
                <form>
                    <h2>Admin Page</h2>
                    <input type="username" name="username" placeholder="Username" />
                    <input type="password" name="password" placeholder="Password" />
                    <button type="submit">Login</button>
                </form>
            </div>
        </>
    );
}

export {AdminPage};