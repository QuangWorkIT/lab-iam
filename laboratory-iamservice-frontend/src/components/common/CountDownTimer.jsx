import { useEffect, useState } from "react"
import { formatRemainTime } from "../../utils/formatter"
import { useDispatch } from "react-redux";
import { removerBannedElement } from "../../redux/features/userSlice";

function CountDownTimer({ endTime, clearItem, className }) {
    const [remainTime, setRemainTime] = useState(0);
    const dispatch = useDispatch()
    useEffect(() => {
        const countDownInterval = setInterval(() => {
            const currentTime = new Date().getTime()
            let timeRemaining = endTime - currentTime

            if (timeRemaining <= 0) {
                timeRemaining = 0
                clearInterval(countDownInterval)
                dispatch(removerBannedElement(clearItem))
            }

            setRemainTime(timeRemaining)
        }, 1000)

        return () => clearInterval(countDownInterval)

    }, [endTime, dispatch, clearItem])

    return (
        <div className={className}>
            {formatRemainTime(remainTime)}
        </div>
    )
}

export default CountDownTimer
