function cloneShapeAtAnchorWithCenterAlignment(shape, x, y) {
  var clonedShape = shape.duplicate();

  // Get the size of the cloned shape
  var width = clonedShape.width;
  var height = clonedShape.height;

  // Calculate the offset between the anchor points and the center of the cloned shape
  var targetAnchor = shape.position;
  var offsetX = x - (targetAnchor[0] + width / 2);
  var offsetY = y - (targetAnchor[1] - height / 2);

  clonedShape.left += offsetX;
  clonedShape.top += offsetY;

  // Move the cloned shape to the top of the layer
  clonedShape.zOrder(ZOrderMethod.BRINGTOFRONT);

  return clonedShape;
}

function cloneShapeGroup(group, targetShape) {
  var clonedGroup = app.activeDocument.groupItems.add(); // Create a new group for the cloned shapes

  for (var i = 0; i < group.pageItems.length; i++) {
    var item = group.pageItems[i];
    if (item.typename === "GroupItem") {
      cloneShapeGroup(item, targetShape);
    } else if (item.typename === "CompoundPathItem") {
      for (var j = 0; j < item.pathItems.length; j++) {
        var subPath = item.pathItems[j];
        if (subPath.typename === "PathItem") {
          for (var k = 0; k < subPath.pathPoints.length; k++) {
            var anchorPoint = subPath.pathPoints[k].anchor;
            var clonedShape = cloneShapeAtAnchorWithCenterAlignment(targetShape, anchorPoint[0], anchorPoint[1]);
            clonedShape.moveToEnd(clonedGroup); // Move the cloned shape to the group
          }
        }
      }
    } else if (item.typename === "PathItem") {
      for (var l = 0; l < item.pathPoints.length; l++) {
        var anchorPoint = item.pathPoints[l].anchor;
        var clonedShape = cloneShapeAtAnchorWithCenterAlignment(targetShape, anchorPoint[0], anchorPoint[1]);
        clonedShape.moveToEnd(clonedGroup); // Move the cloned shape to the group
      }
    }
  }

  return clonedGroup;
}

function cloneShape(sourceShape, targetShape) {
  // Ensure the selected objects are valid paths or groups
  if (
    sourceShape.typename !== "PathItem" &&
    sourceShape.typename !== "GroupItem" &&
    sourceShape.typename !== "CompoundPathItem"
  ) {
    alert("Please select a valid path object or group as the source shape.");
    return;
  }

  var clonedGroup;

  // Clone the target shape at each anchor point in the source shape (circle)
  if (sourceShape.typename === "GroupItem") {
    clonedGroup = cloneShapeGroup(sourceShape, targetShape);
  } else if (sourceShape.typename === "CompoundPathItem") {
    clonedGroup = app.activeDocument.groupItems.add(); // Create a new group for the cloned shapes
    for (var i = 0; i < sourceShape.pathItems.length; i++) {
      var subPath = sourceShape.pathItems[i];
      if (subPath.typename === "PathItem") {
        for (var j = 0; j < subPath.pathPoints.length; j++) {
          var anchorPoint = subPath.pathPoints[j].anchor;
          var clonedShape = cloneShapeAtAnchorWithCenterAlignment(targetShape, anchorPoint[0], anchorPoint[1]);
          clonedShape.moveToEnd(clonedGroup); // Move the cloned shape to the group
        }
      }
    }
  } else if (sourceShape.typename === "PathItem") {
    if (!sourceShape.hasOwnProperty("pathPoints") || sourceShape.pathPoints.length === 0) {
      alert("The source shape has no anchor points to use for cloning.");
      return;
    }

    clonedGroup = app.activeDocument.groupItems.add(); // Create a new group for the cloned shapes
    for (var k = 0; k < sourceShape.pathPoints.length; k++) {
      var anchorPoint = sourceShape.pathPoints[k].anchor;
      var clonedShape = cloneShapeAtAnchorWithCenterAlignment(targetShape, anchorPoint[0], anchorPoint[1]);
      clonedShape.moveToEnd(clonedGroup); // Move the cloned shape to the group
    }
  }

  clonedGroup.selected = true; // Select the newly created group
  alert("Cloning completed!");
}

function main() {
  var sourceShape = null;
  var targetShape = null;

  // Check if exactly two objects are selected
  if (app.selection.length === 2) {
    sourceShape = app.selection[0];
    targetShape = app.selection[1];

    cloneShape(sourceShape, targetShape);
  } else {
    alert("Please select exactly two path objects.");
  }
}

// Call the main function to start the script
main();
