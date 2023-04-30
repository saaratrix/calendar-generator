export function findNearestResolution(width: number, height: number) {
  const resolutions = [
    { name: '800x600', width: 800, height: 600 },
    { name: '1024x768', width: 1024, height: 768 },
    { name: '1280x720', width: 1280, height: 720 },
    { name: '1920x1080', width: 1920, height: 1080 },
    { name: '2560x1440', width: 2560, height: 1440 },
    { name: '3840x2160', width: 3840, height: 2160 },
    { name: '5120x2880', width: 5120, height: 2880 },
    { name: '7680x4320', width: 7680, height: 4320 },
  ];

  let nearestResolution = resolutions[0];
  let smallestDifference = Math.abs(width - nearestResolution.width) + Math.abs(height - nearestResolution.height);

  for (let i = 1; i < resolutions.length; i++) {
    const resolution = resolutions[i];
    const difference = Math.abs(width - resolution.width) + Math.abs(height - resolution.height);
    if (difference < smallestDifference) {
      nearestResolution = resolution;
      smallestDifference = difference;
    }
  }

  return nearestResolution;
}