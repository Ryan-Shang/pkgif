var ID=1;
var lastClickedIDBar="";
var lastClickedIDTime=new Date().getTime();

$("#addNewText").click(function(){
  new text();
  ga('send', 'event', 'Button', 'NewText');
});


var textDefaults={
  type:'text',
  color:"#FFFFFF",
  deleted:0,
  font:'Impact,Charcoal,sans-serif',
  fontSize:24,
  width:20,
  height:50,
  y:canvasHeight/2,
  stroke:"#000000",
  end:gifLength,
  //string:"new text",
  textLength:0,
  dynamic:0, //If we move it
  frames:{},
  strokeSize:1,
  locked:0
};

/*
 * A given piece of text
 */
function text(textCopyingFrom){

  //determine the source array
  var copyingFromExisting=0;
  var sourceValues=textDefaults;
  if (textCopyingFrom!==undefined){
    copyingFromExisting=1;
    sourceValues=textCopyingFrom;
  }

  disableDraw();
  this.type=sourceValues.type;
  //assign an ID
  this.ID=ID;
  ID++;
  this.color=sourceValues.color;
  //Initialize
  var string="new text";
  this.deleted=sourceValues.deleted;
  this.font=sourceValues.font;
  this.fontSize=sourceValues.fontSize;
  this.width=sourceValues.width;
  this.height=sourceValues.height;
  this.y=sourceValues.y;
  this.color=fabricCanvas.freeDrawingBrush.color;//always be the current color
  this.stroke=sourceValues.stroke;
  this.textLength=sourceValues.textLength;
  this.dynamic=sourceValues.dynamic; //If we move it
  // Deep copy the frames (so it's not just a pointer)
  this.frames = jQuery.extend(true, {}, sourceValues.frames);
  this.strokeSize=sourceValues.strokeSize;
  this.locked=sourceValues.locked;
  if (copyingFromExisting){
    this.start=sourceValues.start;
    this.end=sourceValues.end;
    string=textCopyingFrom.fabricObject.text;
  }else{
    this.start=currentFrame()+1;
    this.end=gifLength;
  }




  //Create it
  var left=(canvasWidth-$("#rightWhiteBox").width()-ctx.measureText(string).width)/2;
  var top=(canvasHeight-$("#bottomWhiteBox").height()-50)/2;

  this.createTextInTimeline(string);

  //Center it

  $("#textField").val(string);
  updateString(this);  //Add in the text from the update

  var fabricObject;
  if (copyingFromExisting){
    fabricObject=textCopyingFrom.fabricObject.clone();
  }else{
    //JJK iTEXT use itext instead of text hbelow

    fabricObject= new fabric.Text(string, {
      fontFamily: 'Impact,Charcoal,sans-serif',
      stroke:"rgb(255,255,255)",
      borderColor: 'black',
      cornerColor: 'green',
      fill:this.color,
      cornerSize: 6,
      transparentCorners: false,
      originY:"center",//Do we need to do this and originX,centeredScaling to images as well? I thought so, but it doesn't appear like we do.
      originX:"center",
      centeredScaling:false,
      left:left,
      top:top,
      fontWeight:'normal',
      fontStyle:'normal'
      //hasRotatingPoint: false
    });
  }


  this.fabricObject=fabricObject;



  this.fabricObject.my=this;

  this.fabricObject.on("moving",function(){
    setKeyFrameValues(this);
  });

  this.fabricObject.on("scaling",function(){
    setKeyFrameValues(this);
  });

  this.fabricObject.on("rotating",function(){
    setKeyFrameValues(this);
  });

  fabricCanvas.add(this.fabricObject);

  selectObjectOnCanvas(this.fabricObject);
  if (copyingFromExisting){
    setKeyframesFromObject(this);//must be done after the timeline is drawn
  }

  //this.fabricObject.enterEditing();
  refresh(); //Refresh the frame
};




text.prototype.createTextInTimeline=function(inputTextString){
  var thisText=this;
  //Adding the bar wrapper
  //Change the timeline

  var divString="<div id='timelineTextWrap"+this.ID+"' class='timelineTextWrap' ></div>";

  $("#timelineTextCont").append(divString);        //Add the div in


  //If we click the timeline, move the bar there



  //Adding the bar to the textWrap
  divString="<div id='timelineBar"+this.ID+"' class='timelineBar' ></div>";
  $("#timelineTextWrap"+this.ID).append(divString);
  $("#timelineBar"+this.ID).css("width", (this.end-(this.start-1))*gridSize+"px"); //Changing the size of the bar
  $("#timelineBar"+this.ID).css("left",(this.start-1)*gridSize+"px");//Making it start at the current frame


  //Add the text over the bar
  $("#timelineBar"+this.ID).append("<div id='timelineBar"+this.ID+"OverText' class='timelineOverText'>"+inputTextString+"</div>");
  //On clicking this text, move focus to textField
  $("#timelineBar"+this.ID+"OverText").click(function(){

    $("#textField").focus().select();
  });

  //ALLOW RESIZE
  //Get the max Width
  var maxWidth=$("#timelineTextCont").width();
  $("#timelineBar"+this.ID).resizable({
    handles: 'w,e',
    minWidth: gridSize,
    //containment: 'parent',
    //containment:"#timelineTextWrap"+thisText.ID,
    maxWidth: maxWidth,
    grid: [gridSize,50]
  }).bind("resize", function (e, ui) {
    $(this).css("top", "0px");//for some reason this overrides top and height, so we redo it
    // $(this).css("height", "25px");
    if (ui.position.left<0){
      ui.position.left=0;
      //ui.size.width=ui.originalSize.width; //JJK bug where if you drag left too far left, the right moves. Okay for now.
    }
    //if we are over the whole size
    if (ui.position.left+ui.size.width>maxWidth){
      ui.size.width=maxWidth-ui.position.left;
    }

    thisText.start=ui.position.left/gridSize+1;
    thisText.end=(ui.position.left+ui.size.width)/gridSize;

    //Determine if we moved left or right, so we can move the cursor
    if (ui.position.left==ui.originalPosition.left){
      //we moved the right bar
      canvasGif.move_to(thisText.end-1);

    }else{
      canvasGif.move_to(thisText.start-1);
    }

    canvasGif.pause();

  });


  //ALLOW DRAG
  $( "#timelineBar"+this.ID).draggable({
    axis: "x",
    grid: [ gridSize, 50 ],

    drag: function( event, ui ) {
      if (ui.position.left<0){
        ui.position.left=0;
      }
      var currWidth=$( "#timelineBar"+thisText.ID).width();
      if (ui.position.left+currWidth>maxWidth){
        ui.position.left=maxWidth-currWidth;
      }
      thisText.start=ui.position.left/gridSize+1;
      thisText.end=(ui.position.left+currWidth)/gridSize;
      //canvasGif.move_to(thisText.start-1);
      canvasGif.pause();
      refresh();//In case the text is now in the selected frame

    }
  });


  //Add clicking
  $("#timelineBar"+this.ID).mousedown(function(){
    selectBarInTimeline(thisText);


    //JJK iTEXT
    // var currTime=new Date().getTime();
//
    // if (currTime-lastClickedIDTime<500){//if it's been 500 since last click on a bar
    // if (lastClickedIDBar==thisText.ID){//if the click was on the same bar
    // thisText.fabricObject.enterEditing();
    // }
    // }
    // lastClickedIDBar=thisText.ID;
    // lastClickedIDTime=currTime;



  });

  thisText.changeDivBarHighlight();

  //Make the timeline the right height


  $("#timeline").height($("#timelineTextCont").height());//Set the
  $("#timelineMinLeftShade").height($("#timeline").outerHeight());
  $("#timelineMaxRightShade").height($("#timeline").outerHeight());


  this.createLockDiv();
  this.createCopyDiv();
  //Turn the ends red so people know they can drag them
  $("#timelineBar"+this.ID).children( ".ui-resizable-handle" ).css({
    "background-color":"red",
    "width":"5px"
  });//Turn red
  //$(".ui-resizable-handle").css("background-color","red");//Turn red
  // $(".ui-resizable-handle").css("width","5px");//5 px width
  $("#timelineBar"+this.ID).children(".ui-resizable-w").css("left","0px");//5 px width
  $("#timelineBar"+this.ID).children(".ui-resizable-e").css("right","0px");//5 px width
};



text.prototype.createLockDiv=function(){
  var thisText=this;
  //Add the lock
  divString="<div id='timelineLock"+this.ID+"' class='timelineLock' ><img  id='timelineLockImage"+this.ID+"' src='http://www.gifntext.com/images/lock_off.png' class='lockImage'></div>";
  $("#timelineTextWrap"+this.ID).append(divString);
  $("#timelineLock"+this.ID).click(function(){
    if (thisText.locked)
    {thisText.unlock();}
    else
    {thisText.lock();}
  });

  //  $(".ui-resizable-handle").css("background-color","red");
};

text.prototype.createCopyDiv=function(){
  var thisText=this;
  //Add the duplicate
  divString="<div id='timelineCopy"+this.ID+"' class='timelineCopy' ><img  id='timelineCopyImage"+this.ID+"' src='http://www.gifntext.com/images/copy.png' class='copyImage'></div>";
  $("#timelineTextWrap"+this.ID).append(divString);
  $("#timelineCopy"+this.ID).click(function(){
    new text(thisText);
  });
  $("#timelineCopy"+this.ID).css('margin-left',$("#timeline").width()+5);//add left margin

  $('#timelineCopy'+this.ID).tooltipster({
    content: "Duplicate text layer",
    position:'right'
  });

};





text.prototype.unlock=function(){
  this.locked=0;//unlock
  this.fabricObject.selectable=true; //make the object selectable

  //Change the lock picture
  $("#timelineLockImage"+this.ID).attr("src","images/lock_off.png");

  //Allow pointer events
  $("#timelineBar"+this.ID).css("pointer-events","all");
  $("#timelineTextWrap"+this.ID+" .keyframe").css("pointer-events","all");//turn off all events for the keyframes

  //Allow textdiv to be clicked
  $("#textDiv").css("pointer-events","all");//turn off all events for the keyframes
  if (this==selectedObj){
    $("#textDiv").show();//in case it was hidden
  }
  $("#timelineBar"+this.ID).removeClass("lockedBar");
  selectBarInTimeline(this);
};


text.prototype.lock=function(){
  this.locked=1;//lock
  this.fabricObject.selectable=false;

  //Change the lock picture
  $("#timelineLockImage"+this.ID).attr("src","images/lock_on.png");

  //Don't allow pointer events
  $("#timelineBar"+this.ID).css("pointer-events","none");
  $("#timelineTextWrap"+this.ID+" .keyframe").css("pointer-events","none");//turn off all events for the keyframes

  //If we are the selected text, deselect. Also, add tooltip
  if (this==selectedObj){
    selectedObj="";
    fabricCanvas.deactivateAll().renderAll(true);//deactivate all texts
    refresh();
    //Don't allow textdiv to be clicked
    $("#textDiv").css("pointer-events","none");//turn off all events for the keyframes
    $("#textDiv").hide();//in case it was hidden
  }
  $("#timelineBar"+this.ID).addClass("lockedBar");
};

function selectBarInTimeline(text){
  disableEyeDropper();
  disableDraw();

  $(".tool").removeClass('active'); //remove class active



  //$("#textDiv").show();//in case it was hidden
  selectObjectOnCanvas(text.fabricObject);
  //unhighlight the old selected text in the timeline
  text.changeDivBarHighlight();
}


text.prototype.changeDivBarHighlight=function(){

  $("#timelineTextCont").find(".selectedBar").toggleClass("selectedBar");
  $("#timelineBar"+this.ID).toggleClass("selectedBar");
};


text.prototype.getPosition=function(){
  var x=this.x;
  var y=this.y;
  //Get the x and y values
  if (this.dynamic){//If we are dynamic
    var specifiedInFrame=this.frames[currentFrame()];
    if (specifiedInFrame){
      x=specifiedInFrame.x;
      y=specifiedInFrame.y;
    }
  }
  return {x:x,y:y};
};
/*
 * Returns the position of the last frame. If the current frame is the first one, returns the current frame.
 * don't actually think this is used'
 */
text.prototype.getLastPosition=function(){
  var x=this.x;
  var y=this.y;
  //Get the x and y values
  if (this.dynamic){//If we are dynamic
    var specifiedInFrame=this.frames[currentFrame()-1];
    if (specifiedInFrame){
      x=specifiedInFrame.x;
      y=specifiedInFrame.y;
    }
  }
  return {x:x,y:y};
};




function updateString(fabricObject){
  fabricObject.text=$("#textField").val();
  refresh(); //Refresh the frame
}

