import Toast from 'react-native-toast-message';


const successToast = (message) => {
    Toast.show({
        type: 'success',
        text1: message,
    })
}


const errorToast = (message) => {
    Toast.show({
        type: "error",
        text1: message,
    });
}


function formatDateTimeV2(inputDate) {
    const inputDateTime = new Date(inputDate);

    const month = (inputDateTime.getMonth() + 1).toString().padStart(2, '0');
    const day = inputDateTime.getDate().toString().padStart(2, '0');
    const year = inputDateTime.getFullYear();
    return `${month}/${day}/${year}`;
}

const dateToShortTime = (date_) => {
    let date = new Date(date_);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}



export { dateToShortTime, errorToast, formatDateTimeV2, successToast };

