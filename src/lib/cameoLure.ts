/** Shared between the hero cameo and the footer one: the footer only lures visitors who missed the first. */
export const lure = {
  /** the hero cameo showed up while the hero was on screen, or the game was already started */
  engaged: false,
  /** set by the hero so the footer cameo can start the game from where it stands */
  launch: null as ((pageX: number, pageY: number) => void) | null,
};
