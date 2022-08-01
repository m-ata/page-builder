import React from "react";



function AlignToCenter(props) {
    const { children, backgroundColor } = props;


    return(
        <div style={{width: "100%", top: "0", height: "100%", position: "absolute", zIndex: 1, backgroundColor: backgroundColor ? backgroundColor : 'transparent'}}>
            <div style={{position: "absolute", margin: "0", top:"50%", left: "50%", transform: "translate(-50%, -50%)"}}>
                {children}
            </div>
        </div>
    );
}

export default AlignToCenter;