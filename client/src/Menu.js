import './Menu.css';

import { useRef } from 'react';

function Menu(props) {

    const usernameInput = useRef(null);

    function startGame() {

        const username = usernameInput.current.value === "" ? "UnnamedBlob" : usernameInput.current.value && usernameInput.current.value.length > 12 ? usernameInput.current.value.substring(0, 12) : usernameInput.current.value;
        props.setUsername(username);
        props.setPage("Game")
    }

    return (
        <div className='container'>
            <h1>Agerio</h1>
            <button onClick={startGame}>PLAY</button>
            <input ref={usernameInput} type="text" placeholder="Username" maxLength="12"></input>
        </div>
    );
}

export default Menu;
