Will need:
-The world
/	-Pass a generation
/	-getCell()
/	-SetCell()
/	-Reset world
/	-Randomize world
/	-Set gen loop
/	-Play gen loop
/	-Stop gen loop
/	-setMirroring
	-Adding ratio on randomizer (separated function ?)
	-Optimization
/	-onUpdate
/	-setSize
/	-setState
	-Comments
	-Making -> Resize doesn't reset the content of the world

-The display
/	-with a event click setup
/	-linktoworld
/	-linktocanvas
	-Lot to do for how it's displayed (color, ...)
	-Improve flag system (read more about)
		-the coor comparaisonµ
	-if no gap -> Don't draw the dead cells, put the whole background the color of dead cells
		+ indicator of gap, if on, 's influence on perf maybe ?
	-Indicating that touch change cell state

---

Start doing it well organized.
COMMENT EVERYTHING YOU DO.
Improve it whenever you can.
But NEVER convert it them to classes (this project is literaly for understanding what is being it)