import { Header } from "../components/Header";
import { ProductContainer } from "../components/ProductContainer";
const MainPage = () => {
    
    return (
        <>
            <Header />
            <div>
                <h2>Main page</h2>
                <p>Welcome to the main page!</p>

                <ProductContainer />
            </div>
        </>
    );
}

export {MainPage};