package fi.soveltia.liferay.aitasks.internal.task.node.tool;

import com.liferay.blogs.model.BlogsEntry;
import com.liferay.blogs.service.BlogsEntryService;
import com.liferay.headless.delivery.dto.v1_0.BlogPosting;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.ServiceContextThreadLocal;
import com.liferay.portal.kernel.servlet.taglib.ui.ImageSelector;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.vulcan.dto.converter.DTOConverter;
import com.liferay.portal.vulcan.dto.converter.DTOConverterRegistry;
import com.liferay.portal.vulcan.dto.converter.DefaultDTOConverterContext;

import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;

import fi.soveltia.liferay.aitasks.internal.task.node.type.ImageModelAITaskNode;
import fi.soveltia.liferay.aitasks.internal.task.node.util.ImageUtil;
import fi.soveltia.liferay.aitasks.spi.task.tool.AITaskTool;

import java.util.Base64;
import java.util.Calendar;
import java.util.Locale;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Petteri Karttunen
 */
@Component(property = "ai.task.tool.name=blog", service = AITaskTool.class)
public class BlogAITaskTool implements AITaskTool {

	@Override
	public Object getExecutor(JSONObject configurationJSONObject) {
		return new Executor(configurationJSONObject);
	}

	public class Executor {

		public Executor(JSONObject jsonObject) {
			_jsonObject = jsonObject;
		}

		@Tool(
			"Use this tool only if you know content, subtitle and title and whether to create the cover image. Creates a new blogs entry with a cover image."
		)
		public BlogPosting createBlogsEntry(
				@P("The content") String content,
				@P("Create the cover image?") Boolean createCoverImage,
				@P("The subtitle ") String subtitle,
				@P("The title") String title)
			throws Exception {

			_validateParameters(content, subtitle, title);

			try {
				ServiceContext serviceContext =
					ServiceContextThreadLocal.getServiceContext();

				ImageSelector coverImageSelector = null;

				if (createCoverImage) {
					coverImageSelector = _createImageSelector(title);
				}

				Calendar calendar = Calendar.getInstance();

				return _toBlogPosting(
					blogsEntryService.addEntry(
						title, subtitle, _createDescription(content), content,
						calendar.get(Calendar.MONTH),
						calendar.get(Calendar.DAY_OF_MONTH),
						calendar.get(Calendar.YEAR),
						calendar.get(Calendar.HOUR_OF_DAY),
						calendar.get(Calendar.MINUTE), true, true,
						new String[0], null, coverImageSelector, null,
						serviceContext),
					serviceContext.getLocale(), serviceContext.fetchUser());
			}
			catch (Exception exception) {
				log.error(exception);

				throw exception;
			}
		}

		public String generateImage(
			JSONObject jsonObject, String text, String type) {

			if (type == null) {
				throw new IllegalArgumentException(
					"Image model type is not defined");
			}

			if (StringUtil.equals(type, "googleImagen")) {
				return ImageUtil.generateImage(
					googleImagenAITaskNode.getImageModel(jsonObject), text);
			}
			else if (StringUtil.equals(type, "openAIImageModel")) {
				return ImageUtil.generateImage(
					openAIImageModelAITaskNode.getImageModel(jsonObject), text);
			}

			throw new IllegalArgumentException("Unknown image model");
		}

		private String _createDescription(String content) {
			if (content.length() <= DESCRIPTION_LENGTH) {
				return content;
			}

			return content.substring(0, DESCRIPTION_LENGTH);
		}

		private ImageSelector _createImageSelector(String title) {
			JSONObject jsonObject = _jsonObject.getJSONObject("imageGenerator");

			if (jsonObject == null) {
				return null;
			}

			try {
				String imageBase64 = generateImage(
					jsonObject, title, jsonObject.getString("type"));

				if (Validator.isBlank(imageBase64)) {
					return null;
				}

				return new ImageSelector(
					Base64.getDecoder(
					).decode(
						imageBase64
					),
					StringBundler.concat(_sanitizeFileName(title), ".png"),
					"image/png", StringPool.BLANK);
			}
			catch (Exception exception) {
				log.error("Failed to create image.", exception);
			}

			return null;
		}

		private String _sanitizeFileName(String inputName) {
			return inputName.replaceAll("[^a-zA-Z0-9-_\\.]", "_");
		}

		private BlogPosting _toBlogPosting(
				BlogsEntry blogsEntry, Locale locale, User user)
			throws Exception {

			return blogPostingDTOConverter.toDTO(
				new DefaultDTOConverterContext(
					true, null, dtoConverterRegistry, blogsEntry.getEntryId(),
					locale, null, user));
		}

		private void _validateParameters(
			String content, String subtitle, String title) {

			if (Validator.isBlank(content)) {
				throw new IllegalArgumentException("Content cannot be blank");
			}
			else if (Validator.isBlank(subtitle)) {
				throw new IllegalArgumentException("Subtitle cannot be blank");
			}
			else if (Validator.isBlank(title)) {
				throw new IllegalArgumentException("Title cannot be blank");
			}
		}

		private final JSONObject _jsonObject;

	}

	protected static final int DESCRIPTION_LENGTH = 400;

	protected static final Log log = LogFactoryUtil.getLog(
		BlogAITaskTool.class);

	@Reference(
		target = "(component.name=com.liferay.headless.delivery.internal.dto.v1_0.converter.BlogPostingDTOConverter)"
	)
	protected DTOConverter<BlogsEntry, BlogPosting> blogPostingDTOConverter;

	@Reference
	protected BlogsEntryService blogsEntryService;

	@Reference
	protected DTOConverterRegistry dtoConverterRegistry;

	@Reference(target = "(ai.task.node.type=googleImagen)")
	protected ImageModelAITaskNode googleImagenAITaskNode;

	@Reference(target = "(ai.task.node.type=openAIImageModel)")
	protected ImageModelAITaskNode openAIImageModelAITaskNode;

}