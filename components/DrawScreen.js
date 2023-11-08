import React, { useState, useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import { Canvas, Skia, Drawing, useCanvasRef } from "@shopify/react-native-skia";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { DeviceMotion } from 'expo-sensors';

import { Box, IconButton, Icon, Center, Text, Button, HStack, Divider, ScrollView, Radio } from "native-base";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TriangleColorPicker, fromHsv } from 'react-native-color-picker'
import { saveImageBase64, saveSvgBase64 } from '../utils';
import { debounce } from 'lodash';


export default function DrawScreen({ navigation }) {
	const insets = useSafeAreaInsets();
	const [isDrawing, setIsDrawing] = useState(false);
	const [isOverlay, setIsOverlay] = useState(true);
	const [currentColor, setCurrentColor] = useState(Skia.Color('black'));
	const [cavnasBackground, setCanvasBackground] = useState(Skia.Color('white'));
	const [paths, setPaths] = useState([]);
	const [isSaving, setIsSaving] = useState(false);

	const [mode, setMode] = useState(1);

	const canvasRef = useCanvasRef();
	const height = Dimensions.get('window').height;
	const width = Dimensions.get('window').width;

	const setDebouncedColor = debounce((color) => {
		setCurrentColor(Skia.Color(fromHsv(color)));
	}, 300);

	const toggleOverlay = () => {
		setIsOverlay((prev) => !prev);
	}

	const exportAsSvg = (paths, cavnasBackground) => {
		const strings = [];
		const background = Skia.Path.Make();
		background.addRect({
			x: 0,
			y: 0,
			width: width,
			height: height,
		});
		const canvasColor = cavnasBackground.map((c) => Math.floor(c * 255));
		strings.push(`<path d="${background.toSVGString()}" fill="rgb(${canvasColor[0]},${canvasColor[1]},${canvasColor[2]})"/>`);
		paths.forEach(({ path, color, type, stroke }) => {
			const c = color.map((c) => Math.floor(c * 255));
			const colorString = `rgb(${c[0]},${c[1]},${c[2]})`;
			const strokeString = parseFloat(stroke).toFixed(2);
			if (type == "shape") {
				strings.push(`<path d="${path.toSVGString()}" fill="${colorString}"/>`);
			} else {
				strings.push(`<path d="${path.toSVGString()}" stroke-linecap="round" stroke="${colorString}" stroke-width="${strokeString}"/>`);
			}
		});

		const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` + strings.join('') + '</svg>';

		const Buffer = require("buffer").Buffer;
		const base64 = Buffer.from(svg).toString("base64");
		return base64;
	}


	const saveCanvas = async () => {
		setIsSaving(true);
		const base64image = await canvasRef.current?.makeImageSnapshot().encodeToBase64();
		const date = Date.now().toString();
		await saveImageBase64(base64image, date);
		const base64svg = exportAsSvg(paths, cavnasBackground);
		await saveSvgBase64(base64svg, date);
		setIsSaving(false);
	}

	return (
		<SafeAreaProvider>
			<View style={{
				flex: 1
			}}>
				{!isDrawing && <IconButton
					style={{ position: 'absolute', bottom: insets.bottom + 20, right: insets.right + 20, zIndex: 100 }}
					_pressed={{ bg: "#e32f45", opacity: 0.5 }}
					variant="solid"
					borderRadius="full"
					size="lg"
					bg="#e32f45"
					icon={
						<Icon
							as={MaterialCommunityIcons}
							size="6"
							name="palette-outline"
						/>}
					onPress={toggleOverlay}
					isDisabled={isSaving}
				/>
				}

				{isOverlay &&
					<Box
						position="absolute"
						top={0}
						left={0}
						right={0}
						bottom={0}
						bg="rgba(0,0,0,0.5)"
						zIndex={99}
					>
						<SafeAreaView>
							<Box
								bg="white"
								rounded="lg"
								p={4}
								m={4}
								shadow={2}
								style={{ maxHeight: height - insets.bottom - insets.top - 20 }}
							>
								<Center>
									<Text fontSize={'3xl'} fontWeight="thin">Painting palette</Text>
									<HStack space={2} alignItems="center" justifyContent="center" mt={4}>
										<Button
											borderWidth={0}
											size="sm"
											variant="outline"
											bg="#e32f45"
											_pressed={{ bg: "#e32f45", opacity: 0.5 }}
											onPress={() => {
												navigation.navigate('Main');
											}}
											isDisabled={isSaving}
										>
											<Text color="white">Back to gallery</Text>
										</Button>
										<Button
											borderWidth={0}
											size="sm"
											type="primary"
											bg="#50c878"
											_pressed={{ bg: "#50c878", opacity: 0.5 }} s
											onPress={async () => {
												await saveCanvas();
												navigation.navigate('Main');
											}}
											isLoading={isSaving}
											isDisabled={isSaving}
										>
											<Text color="white">Save painting</Text>
										</Button>
									</HStack>
								</Center>

								<Divider my={2} />
									<Text fontSize={'xl'} fontWeight="thin">Painting color</Text>
									<TriangleColorPicker
										onColorChange={setDebouncedColor}
										style={{ width: "100%", height: 300 }}
										hideControls={true}
									/>
									<Button size="sm" variant="outline" style={{ borderColor: '#e32f45' }} _pressed={{ bg: "transparent", opacity: 0.3 }} onPress={() => {
										setCanvasBackground(currentColor);
									}}>
										<Text color="#e32f45">Set canvas background</Text>
									</Button>
									<Divider my={2} />
									<Text fontSize={'md'} fontWeight="thin" mb={1}>Draw mode</Text>
									<Radio.Group
										name="mode"
										value={mode}
										onChange={(value) => {
											setMode(value);
										}}
										defaultValue={0}
									>
										<Radio value={0} my={1} colorScheme="custom">
											Portrait
										</Radio>
										<Radio value={1} my={1} colorScheme="custom">
											Landscape
										</Radio>
									</Radio.Group>
									<Text fontSize={'md'} fontWeight="thin" mb={1}>Clear canvas</Text>
									<Button size="sm" variant="outline" style={{ borderColor: '#e32f45' }} _pressed={{ bg: "transparent", opacity: 0.3 }} onPress={() => {
										setPaths([]);
									}}>
										<Text color="#e32f45">Clear canvas</Text>
									</Button>
							</Box>

						</SafeAreaView>
					</Box>

				}

				<DrawCanvas
					height={height}
					width={width}
					canvasRef={canvasRef}
					isDrawing={isDrawing}
					setIsDrawing={setIsDrawing}
					currentColor={currentColor}
					canvasBackground={cavnasBackground}
					isOverlay={isOverlay}
					paths={paths}
					setPaths={setPaths}
					mode={mode}
				/>
			</View>
		</SafeAreaProvider>
	);
}


const DrawCanvas = ({
	height, width, isDrawing, setIsDrawing,
	currentColor, canvasBackground, isOverlay, canvasRef, paths, setPaths, mode, 
}) => {
	const [currentPossition, setCurrentPossition] = useState([width / 2, height / 2]);
	const [lastPossition, setLastPossition] = useState([width / 2, height / 2]);
	const [data, setData] = useState(null);


	const processMotion = (data) => {
		if (data) {
			const { beta, gamma } = data.rotation;

			const maxAngle = Math.max(Math.abs(beta), Math.abs(gamma));

			const speed = 300 + (1 - maxAngle / 90) * 400;
			var x = 0;
			var y = 0;
			if (mode == 0) {
				x = Math.sin(gamma * Math.PI / 180) * Math.cos(beta * Math.PI / 180);
				y = Math.sin(beta * Math.PI / 180);
			
			} else {
				y = Math.sin(beta * Math.PI / 180) * Math.cos(gamma * Math.PI / 180);
				x = Math.sin(gamma * Math.PI / 180);
			}



			const xSpeed = x * speed;
			const ySpeed = y * speed;
			var xPossition = currentPossition[0] + xSpeed;
			var yPossition = currentPossition[1] + ySpeed;

			// clamp the possition to the screen
			xPossition = Math.max(0, Math.min(xPossition, width));
			yPossition = Math.max(0, Math.min(yPossition, height));

			setCurrentPossition([xPossition, yPossition]);
		}
	}

	useEffect(() => {
		DeviceMotion.addListener(setData);
		DeviceMotion.setUpdateInterval(20);

		return () => DeviceMotion.removeAllListeners();
	}, []);

	useEffect(() => {
		if (isOverlay) {
			return;
		}
		processMotion(data);
	}, [data]);


	const toggleDrawing = () => {
		if (isDrawing) {
			setIsDrawing(false);
		}
		else {
			setIsDrawing(true);
			setLastPossition(currentPossition);
		}
	}

	const max_line_width = Math.random() * 5 + 25;
	const new_size_influence = 0.5;
	let sizeM = 0;

	useEffect(() => {
		if (isDrawing) {
			const start_x = lastPossition[0];
			const start_y = lastPossition[1];
			const end_x = currentPossition[0];
			const end_y = currentPossition[1];
			const distance = Math.ceil(Math.sqrt(Math.pow(end_x - start_x, 2) + Math.pow(end_y - start_y, 2)));
			const new_size = distance > 0 ? max_line_width / distance : max_line_width / 90;
			

			// interpolate
			sizeM = new_size_influence * new_size + (1 - new_size_influence) * sizeM;

			splat(start_x, start_y, end_x, end_y, sizeM, distance);

			setLastPossition(currentPossition);
		}
	}, [currentPossition]);


	const splat = (x1, y1, x2, y2, size, distance) => {
		const fills = [];
		const path = Skia.Path.Make();
		path.moveTo(x1, y1);
		const midpoint = [(x1 + x2) / 2, (y1 + y2) / 2];
		const randomOffsetMidpoint = [midpoint[0] + (Math.random() - 0.5) * distance / 2, midpoint[1] + (Math.random() - 0.5) * distance / 2];
		path.quadTo(randomOffsetMidpoint[0], randomOffsetMidpoint[1], x2, y2);


		let i = 0;
		const isSplashed = Math.random() > 0.5;
		while (i < Math.floor(5 * Math.pow(Math.random(), 4)) && isSplashed) {
			const ElipseSize = size * (0.05 + Math.random()) * 2;

			const randX = distance * 4 * (Math.pow(Math.random(), 2) - 0.5);
			const randY = distance * 4 * (Math.pow(Math.random(), 2) - 0.5);


			const c = Skia.Path.Make()
			const circleX = x1 + randX + (Math.random() - 0.5);
			const circleY = y1 + randY + (Math.random() - 0.5);
			c.addCircle(circleX, circleY, ElipseSize);
			fills.push({ path: c, color: currentColor, type: "shape" });

			// if the distance is small then add big elipse
			if (distance < 3) {
				const cX = x1 + ElipseSize * Math.cos(Math.random() * 2 * Math.PI);
				const cY = y1 + ElipseSize * Math.sin(Math.random() * 2 * Math.PI);
				const r = Skia.Path.Make();
				r.addOval({
					x: cX,
					y: cY,
					width: ElipseSize * (.9 + Math.random()),
					height: ElipseSize * (.9 + Math.random()),
				});
				fills.push({ path: r, color: currentColor, type: "shape" });
			}

			i = i + 1;
		}

		const pathStroke = size;
		setPaths((paths) => [...paths, { path: path, stroke: pathStroke, color: currentColor, type: "path" }, ...fills]);
	}

	return (
		<Canvas
			style={{ flex: 1 }}
			onTouchStart={() => {
				toggleDrawing();
			}}
			ref={canvasRef}
		>
			<Drawing
				drawing={({ canvas, paint }) => {
					canvas.clear(canvasBackground);

					paths.forEach(({ path, stroke, color, type }) => {
						paint.setAntiAlias(true);
						paint.setColor(color);
						if (type == "path") {
							paint.setStyle(1);
							paint.setStrokeCap(1);
							paint.setStrokeWidth(stroke);
							canvas.drawPath(path, paint);
						}
						if (type == "shape") {
							paint.setStyle(0);
							paint.setStrokeCap(0);
							canvas.drawPath(path, paint);
						}
					});

					if (!isDrawing && !isOverlay) {
						paint.setStyle(0);
						paint.setStrokeCap(0);
						paint.setColor(currentColor);
						canvas.drawCircle(currentPossition[0], currentPossition[1], 4, paint);
					}
				}}
			/>
		</Canvas>
	);
}


