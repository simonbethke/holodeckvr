# Holodeck VR
Do you remember the good old star treck times when Jean-Luc Picard was utilizing the recreational holo-decks? This is exactly what I would like to create in off the shelve VR headsets. Giving everybody the power to grab a camera, video-capture a real static scene and review it in virtual realitiy as if this scene would exist at any time and any place. This shall become the evolution of photography that enables everybody to step into a scene and re-ecperience it.

# Prerequisites
To playback a scene I am using a Meta Oculus 2 connected via Airlink to a computer that runs an NVidia RTX 3060. I am sure that all these specs don't matter to the detail but the more the better.
For capturing scenes you need to get familiar with Nerfstudio or any tool that can create gaussian splats. I am currently using a midpriced Sony Camera with a nice wide-angle lense to capture scenes. However, I already experimented with capturing scenes just with a smartphone and it worked well too. The most tricky and time-consuming part is to get Structure from motion by using a tool like Colmap (that is integrated with Nerfstudio). There are much better commercial tools for this, that I don't use.

# Goals of this Project
* I want to create a portable scene format that combines gaussian splats, a skybox and ambience sound to create a virtual reality close to the real scene
* There should be a viewer for those scenes that is web-based (using WebXR) and builds upon the GaussianSplats3D project by Mark Kellogg. To add ambience sound and the skybox, THREE js shall be used.
* Navigation should be possible in VR - however, ideally a scene should be walkable by utilizing 6DOF. 
* While viewing existing scenes will be easy for people with appropriate hardware, documentation and maybe tutorials should be available to enable everybody to capture own scenes.
