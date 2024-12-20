import { cn } from "@bera/ui";
import { Icons } from "@bera/ui/icons";

export interface VerifiedSteps {
  steps: boolean[];
  errors: (string | null)[];
}

const ProcessSteps = ({
  /**
   * Array of titles for each step
   * @type {string[]}
   */
  titles,
  /**
   * Index of the selected step
   * @type {number}
   */
  selectedStep,
  /**
   * Indexes of the completed steps
   * @type {number[]}
   */
  completedSteps,
  /**
   * Function to set the selected step
   * @type {(arg0: number) => void}
   */
  setCurrentStep,
  /**
   * Object containing the verification status of each step
   * @type {VerifiedSteps}
   */
  verifiedSteps,
}: {
  titles: string[];
  selectedStep: number;
  completedSteps: number[];
  setCurrentStep: (arg0: number) => void;
  verifiedSteps: VerifiedSteps;
}) => {
  function isStepSelectable(index: number) {
    // NOTE: we check -1 to allow you to go back to the current (partially-completed) step
    return completedSteps.includes(index) || completedSteps.includes(index - 1);
  }

  return (
    <div className="flex flex-wrap items-start gap-4 overflow-visible py-2 xl:flex-col xl:gap-8">
      {titles.map((title, index) => (
        <div
          key={index}
          title={(isStepSelectable(index) && verifiedSteps.errors[index]) || ""}
          className={cn(
            "relative",
            isStepSelectable(index) ? "cursor-pointer" : "cursor-not-allowed",
          )}
          onClick={() => {
            isStepSelectable(index) && setCurrentStep(index);
          }}
        >
          {index < titles.length - 1 && (
            <div className="absolute left-4 top-full hidden h-8 w-0.5 bg-processStepBackground xl:block" />
          )}
          <div
            className={cn(
              "relative flex w-fit overflow-hidden rounded-sm border shadow-md xl:w-48 2xl:w-64",
              selectedStep === index &&
                "bg-processStepBackground bg-opacity-55",
            )}
          >
            {selectedStep === index && (
              <div className="w-1 flex-shrink-0 bg-info-foreground" />
            )}
            <div className="flex w-full justify-between p-4">
              <h3 className="text-nowrap pr-2 font-normal">{title}</h3>
              {completedSteps.includes(index) &&
                (verifiedSteps.steps[index] ? (
                  <Icons.checkCircle className="text-semanticSuccessForeground" />
                ) : (
                  <Icons.xCircle className="text-destructive-foreground" />
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProcessSteps;