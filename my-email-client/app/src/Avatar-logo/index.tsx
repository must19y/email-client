// designing the logo of the email address name

import  styles  from "./index.module.css";


const Avatar=({ letter }:{letter:string}):JSX.Element=>{
    let initial= letter.charAt(0).toUpperCase();
    return(
        <div className={styles.avatar}>
            {initial}
        </div>
    );

}

export default Avatar;