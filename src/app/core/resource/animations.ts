import { animate, group, state, style, transition, trigger } from "@angular/animations";

export const SlideInOutAnimation = [
    trigger("inOutPaneAnimation", [
		transition(":enter", [
		  style({ opacity: 1, transform: "translateX(100%)" }), //apply default styles before animation starts
		  animate(
			"790ms ease-in-out",
			style({ opacity: 1, transform: "translateX(0)" })
		  )
		])
	  ])
]


