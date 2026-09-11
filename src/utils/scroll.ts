/**
 * Custom smooth scroll helper that accurately navigates to sections
 * while accounting for the fixed navbar height and dynamic heights.
 */
export function scrollToSection(sectionId: string) {
  const targetId = sectionId.replace(/^#/, '').replace(/^\//, '').replace(/^#/, '');
  
  if (!targetId || targetId === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const element = document.getElementById(targetId);
  if (element) {
    const navbarOffset = 90; // Height of fixed navbar + breathing room
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = Math.max(0, elementPosition - navbarOffset);

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  } else {
    // If we are on another page, navigate to homepage with hash
    if (window.location.pathname !== '/') {
      window.location.href = `/#${targetId}`;
    }
  }
}
