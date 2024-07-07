import "react-step-progress-bar/styles.css";
import { ProgressBar, Step } from "react-step-progress-bar";
import HumanNumber from "./HumanNumber";

export type Milestone = {
  index: number;
  title: string;
  emoji: string;
  position: number;
};

const ProgressBarComponent = ({
  percent,
  goal,
  milestones,
  tokenSymbol,
}: {
  percent: number;
  goal: number;
  tokenSymbol: string;
  milestones: Milestone[] | undefined;
}) => {
  return (
    <div className="flex flex-row min-h-32 relative w-full mb-8">
      <div className="w-full pt-4">
        <ProgressBar
          percent={percent || 0}
          height={44}
          filledBackground="#40D472"
          hasStepZero={false}
          unfilledBackground="#E6E6E6"
          // @ts-ignore
          stepPositions={milestones && milestones.map((step) => step.position)}
        >
          {milestones &&
            milestones.map((step, index) => (
              <Step transition="scale" className="relative" key={index}>
                {({ accomplished }) => (
                  <div className="flex flex-col absolute top-[-40px] left-0 ">
                    {!accomplished && (
                      <div
                        className={`mx-auto w-1 bg-[#E6E6E6] h-[60px] text-5xl text-center mt-5`}
                      ></div>
                    )}
                    {accomplished && (
                      <div
                        className={`mx-auto w-20 h-20 ${
                          accomplished ? "bg-[#4BE980]" : "bg-gray-500"
                        } rounded-full text-5xl text-center pt-4`}
                      >
                        {accomplished && milestones[index].emoji}
                      </div>
                    )}
                    <div className="mt-2 text-center text-[#A0A0A0] font-bold min-w-14">
                      {milestones[index].title}
                    </div>
                  </div>
                )}
              </Step>
            ))}
        </ProgressBar>
      </div>
      <div className="ml-2 flex flex-col text-center pt-4">
        <div className="text-4xl flex-nowrap text-nowrap font-bold">
          <div className="flex flex-row items-baseline">
            <HumanNumber value={goal} />
            {tokenSymbol && <span className=" text-xl"> {tokenSymbol}</span>}
          </div>
        </div>
        <div className="text-[#A0A0A0] font-bold text-center text-2xl w-full">
          Goal
        </div>
      </div>
    </div>
  );
};

export default ProgressBarComponent;
