import { useRef } from 'react';

import style from './menu.module.css';

function Menu(props) {

    const usernameInput = useRef(null);

    function startGame() {

        const username = usernameInput.current.value === "" ? "UnnamedBlob" : usernameInput.current.value && usernameInput.current.value.length > 12 ? usernameInput.current.value.substring(0, 12) : usernameInput.current.value;
        props.setUsername(username);
        props.setPage("Game")
    }

    return (
        <div className={style.container}>
            <h1 className={style.title}>Ager<span>IO</span></h1>
            <button className={style.playBtn} onClick={startGame}>PLAY</button>
            <input className={style.usernameInput} ref={usernameInput} type="text" placeholder="Username" maxLength="12"></input>
        </div>
    );
}

export default Menu;
